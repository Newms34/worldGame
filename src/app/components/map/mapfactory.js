class hexGrid {
    //factory Class to construct a hexagonal civ-style grid, where each grid cell has a particular terrain type 
    constructor(canvId, sl, usr, cellLoad, usrs, $http) {
        this.canv = document.getElementById(canvId);
        this.usr = usr;
        this.width = screen.width * 1.3;
        this.height = screen.height * 2;
        this.canv.style.width = this.width + 'px';
        this.canv.style.height = this.height + 'px';
        this.canv.width = this.width;
        this.canv.height = this.height;
        this.isDragging = false;
        this.line = null;
        this.$http = $http;
        this.ctx = this.canv.getContext('2d');
        this.hexagonAngle = Math.PI * 30 / 180; // 30 degrees in radians
        this.sideLength = sl;
        this.hexHeight = Math.sin(this.hexagonAngle) * this.sideLength;
        this.hexRadius = Math.cos(this.hexagonAngle) * this.sideLength;
        this.hexRectangleHeight = this.sideLength + 2 * this.hexHeight;
        this.hexRectangleWidth = 2 * this.hexRadius;
        this.avgWid = ((2 * this.hexRectangleWidth) + (this.hexRadius)) / 2;
        this.avgHeight = this.sideLength * 2 / 0.75;
        this.boardWidth = Math.ceil(this.width / this.avgWid);
        this.boardHeight = Math.ceil(this.height / this.avgHeight);
        this.cellColors = ['water', 'grass', 'desert', 'mountain', 'deepWater'];
        this.users = []
            //now we should have the number of cells on the board
        if (cellLoad) {
            this.cells = cellLoad;
            //loading a previous game
            this.users = usrs;
        } else {
            //new game, so make cells
            this.cells = hexGrid.makeCells(this.boardWidth, this.boardHeight);
            //and randomly place users
            this.placeUsers(usrs);
        }
        //
        hexGrid.prepCanv(this);
    }
    placeUsers(usrList) {
        console.log(this.cells, this.boardWidth, this.boardHeight);
        const that = this;
        usrList.forEach(un => {
            let x = 0,
                y = 0,
                ranOnce = false,
                actualX, actualY, tooClose = false;
            while (!ranOnce || this.cells[y][x].owner || (that.cells[y][x].type !== 1 && that.cells[y][x].type !== 2) || tooClose) {
                //keep repeating until we find an empty cell
                x = Math.floor(Math.random() * that.cells[0].length);
                y = Math.floor(Math.random() * that.cells.length);
                actualX = (x + 0.5) * that.hexRectangleWidth + ((y % 2) * that.hexRadius);
                actualY = (y + 0.5) * (that.hexHeight + that.sideLength);
                tooClose = that.returnNeighbors(actualX, actualY).filter(tcn => {
                    return tcn.id == that.cells[y][x].id;
                }).length > 1;
                ranOnce = true;
            };
            that.cells[y][x].contents.push('settler')
            that.returnNeighbors(actualX, actualY).forEach(nc => {
                that.getCellAtPoint(nc.x, nc.y).owner = un;
            });
            console.log('user', un, 'starts in cell', x, ',', y)
            this.cells[y][x].owner = un;
        })
    }
    drawHexagon(x, y, hover, color, owner) {
        //draw a single hexagon
        if (this.usr !== owner) {
            this.ctx.fillStyle = '#111';
            this.ctx.strokeStyle = '#111';
            this.ctx.lineWidth = 1;
        } else {
            this.ctx.fillStyle = color;
            this.ctx.strokeStyle = '#fff';
            if (hover) {
                this.ctx.lineWidth = 2;
            } else {
                this.ctx.lineWidth = 0;
            }
        }
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.hexRadius, y);
        this.ctx.lineTo(x + this.hexRectangleWidth, y + this.hexHeight);
        this.ctx.lineTo(x + this.hexRectangleWidth, y + this.hexHeight + this.sideLength);
        this.ctx.lineTo(x + this.hexRadius, y + this.hexRectangleHeight);
        this.ctx.lineTo(x, y + this.sideLength + this.hexHeight);
        this.ctx.lineTo(x, y + this.hexHeight);
        this.ctx.closePath();
        this.ctx.fill();
        // this.ctx.strokeText(`${x}`, x + this.hexRadius, y + this.hexRadius)
        // this.ctx.strokeText(`${y}`, x + this.hexRadius, y + this.hexRadius + 10)
        if (hover || this.usr !== owner) {
            this.ctx.stroke();
        }
    }
    addLine(start, end) {
        console.log('Drawing line from', start, 'to', end)
        this.ctx.strokeStyle = '#00f';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.closePath()
        this.ctx.stroke();
    }
    get cellList() {
        return this.cells;
    }
    set cellList(cls) {
        this.cells = cls;
        this.drawBoard();
    }
    get dims() {
        return [this.boardWidth, this.boardHeight];
    }

    getOneCell(x, y) {
        return this.getCellAtPoint(x, y);
    }
    drawBoard() {
        const that = this;
        this.cells.forEach((cr, y) => {
            cr.forEach((ci, x) => {
                const celCol = that.cellColors[ci.type];
                // i * hexRectangleWidth + ((j % 2) * hexRadius),
                // j * (sideLength + hexHeight),
                this.drawHexagon((x * that.hexRectangleWidth + ((y % 2) * that.hexRadius)), (y * (that.sideLength + that.hexHeight)), false, celCol, ci.owner)
            })
        });
        if (this.line) {
            this.addLine(this.line.start, this.line.end)
        }
    }

    xyToCellCenter(x, y) {
        //converts an (x,y) pair to a more 'generalized' center of a hexagon
        const hexY = Math.floor(y / (this.hexHeight + this.sideLength)),
            hexX = Math.floor((x - (hexY % 2) * this.hexRadius) / this.hexRectangleWidth),
            screenX = (hexX + 0.5) * this.hexRectangleWidth + ((hexY % 2) * this.hexRadius),
            screenY = (hexY + 0.5) * (this.hexHeight + this.sideLength);
        return { x: screenX, y: screenY };
    }

    returnNeighbors(x, y) {
        const dist = this.hexRadius * 2,
            aDist = Math.sin(Math.PI * 45 / 180) * dist,
            cent = this.xyToCellCenter(x, y),
            // hexY = Math.floor(y / (this.hexHeight + this.sideLength)),
            // hexX = Math.floor((x - (hexY % 2) * this.hexRadius) / this.hexRectangleWidth),
            // screenX = (hexX + 0.5) * this.hexRectangleWidth + ((hexY % 2) * this.hexRadius),
            // screenY = (hexY + 0.5) * (this.hexHeight + this.sideLength),
            neighborCoords = [{
                x: cent.x - aDist,
                y: cent.y - aDist,
            }, {
                x: cent.x + aDist,
                y: cent.y - aDist,
            }, {
                x: cent.x + dist,
                y: cent.y,
            }, {
                x: cent.x + aDist,
                y: cent.y + aDist,
            }, {
                x: cent.x - aDist,
                y: cent.y + aDist,
            }, {
                x: cent.x - dist,
                y: cent.y,
            }];
        return neighborCoords.filter(nbf => {
            return this.getCellAtPoint(nbf.x, nbf.y);
        });
    }
    findSameType(cell, type) {
        return cell.contents.filter((ct) => {
            return ct.isMil == type;
        })
    }
    navigate(start, end, unit, usr) {
        //move a friendly unit onto a friendly (or unowned) cell
        const startCell = this.getCellAtPoint(start.x, start.y),
            endCell = this.getCellAtPoint(end.x, end.y),
            { $http } = this;
        navTypes = [
            [0, 4],
            [1, 2, 3],
            [0, 1, 2, 3, 4]
        ]; //water,land, amphibious
        if (navTypes[unit.navTypes].indexOf(startCell.type) < 0 || navTypes[unit.navTypes].indexOf(endCell.type) < 0) {
            //either the start or end cell is not in this unit's list of appropriate nav 'types'
            //for example, a boat traveling onto land, or a land-only unit attempting to cross water
            return { status: 'badNav', ok: false };
        } else if (!!unit.mtns && (startCell.type == 3 || endCell.type == 3)) {
            //unit does not have the 'mtns' flag, so it cannot travel onto mountains.
            return { status: 'badNav', ok: false };
        } else {
            const naybs = this.returnNeighbors(start.x, start.y).map(nb => {
                return this.getCellAtPoint(nb.x, nb.y);
            });
            if (naybs.map(nn => nn.id).indexOf(endCell.id) < 0) {
                //cells are NOT neighbors.
                return { status: 'tooFar', ok: false };
            } else if (usr != endCell.owner) {
                return { status: 'checkWar', usr: endCell.owner, ok: false }
            } else if (this.findSameCellType(end, start.isMil)) {
                return { status: 'occupied', contents: endCell.contents, ok: false }
            } else {
                //everything (should!) check out!
                return { status: 'moved', ok: true };
            }
        }
    }
    checkStartWar(usr, targ) {
        if (targ.owner == usr) {
            //cannot attack self!
            return { status: 'selfAttack', ok: false }
        } else {
            return { status: 'attacked', ok: true }
        }
    }
    getCellAtPoint(x, y) {
        const hexY = Math.floor(y / (this.hexHeight + this.sideLength)),
            hexX = Math.floor((x - (hexY % 2) * this.hexRadius) / this.hexRectangleWidth);

        // Check if the mouse's coords are on the board
        if (hexX >= 0 && hexX < this.boardWidth) {
            if (hexY >= 0 && hexY < this.boardHeight) {
                return this.cells[hexY][hexX];
            } else {
                return false;
            }
        }
        return false;
    }

    checkAppropNeighbors(x, y) {
        const neighbors = this.returnNeighbors(x, y),
            cell = this.getCellAtPoint(x, y);
        if (cell.type !== 0 && cell.type !== 3) {
            //neither mountain (which needs extra land) or water (which checks for deep)
            return true;
        }
        if (cell.type === 3) {
            //mtn
            neighbors.forEach(nbc => {
                const nCell = this.getCellAtPoint(nbc.x, nbc.y);
                if (nCell.type === 0) {
                    nCell.type = Math.ceil(Math.random() * 2)
                }
            })
        }
        if (cell.type === 0 && !neighbors.filter(nbw => {
                return this.getCellAtPoint(nbw.x, nbw.y).type !== 0 && this.getCellAtPoint(nbw.x, nbw.y).type !== 4;
            }).length) {
            cell.type = 4;
        }
    }
    static makeCells(bw, bh) {
        const cellArr = new Array(bh).fill(100).map((cr, h) => {
            return new Array(bw).fill(100).map((cc, w) => {
                const isWater = Math.random() > .2,
                    type = isWater ? 0 : Math.ceil(Math.random() * 3);
                // return new gridCell(h, w, type, [], 'Dave')
                return {
                    x: h,
                    y: w,
                    type: type,
                    contents: [],
                    owner: null,
                    id: Math.floor(Math.random() * 9999999).toString(32)
                }
            })
        });
        return cellArr;
    }

    static prepCanv(grid) {
        console.log('preparing canvas!',
            grid.canv)
        const texProms = grid.cellColors.map(tex => {
            return new Promise((resolve,
                reject) => {
                const theImg = new Image();
                theImg.src = '/img/' + tex + '.jpg';
                theImg.onload = () => {
                    resolve({
                        img: theImg,
                        name: tex,
                        status: 'ok'
                    });
                }
                theImg.onerror = () => {
                    reject({
                        img: theImg,
                        name: tex,
                        status: 'err'
                    })
                }
            })
        })
        Promise.all(texProms).then((r) => {
            console.log('texProms', r)
            grid.cellColors = grid.cellColors.map(cc => {
                    return grid.ctx.createPattern(r.filter(ft => {
                        return cc == ft.name;
                    })[0].img, 'repeat');
                })
                //now we check to make sure mountain and water tiles are appropriately surrounded
            for (let a = 0; a < grid.cells.length; a++) {
                for (let b = 0; b < grid.cells[a].length; b++) {
                    screenX = (grid.cells[a][b].x + 0.5) * grid.hexRectangleWidth + ((grid.cells[a][b].y % 2) * grid.hexRadius);
                    screenY = (grid.cells[a][b].y + 0.5) * (grid.hexHeight + grid.sideLength);
                    grid.checkAppropNeighbors(screenX, screenY);
                }
            }
            grid.drawBoard();
        })
        grid.canv.addEventListener("mousemove", function(eventInfo) {
            let x,
                y,
                hexX,
                hexY,
                screenX,
                screenY;


            x = eventInfo.offsetX || eventInfo.layerX;
            y = eventInfo.offsetY || eventInfo.layerY;
            hexY = Math.floor(y / (grid.hexHeight + grid.sideLength));
            hexX = Math.floor((x - (hexY % 2) * grid.hexRadius) / grid.hexRectangleWidth);
            screenX = hexX * grid.hexRectangleWidth + ((hexY % 2) * grid.hexRadius);
            screenY = hexY * (grid.hexHeight + grid.sideLength);

            grid.ctx.clearRect(0, 0, grid.canv.width, grid.canv.height);

            //we draw the full board, THEN redraw the hovered hex (if any)
            grid.drawBoard(grid.ctx, grid.boardWidth, grid.boardHeight);

            const cell = grid.getCellAtPoint(x, y);
            if (!cell) {
                return false;
            }
            grid.drawHexagon(screenX, screenY, true, grid.cellColors[cell.type], cell.owner);
            const neighbors = grid.returnNeighbors(x, y);
            // console.log('User hovering over cell', cell, 'whose neighbors are', neighbors)
            neighbors.forEach((nb) => {
                let nCell = grid.getCellAtPoint(nb.x, nb.y),
                    nhexY = Math.floor(nb.y / (grid.hexHeight + grid.sideLength)),
                    nhexX = Math.floor((nb.x - (nhexY % 2) * grid.hexRadius) / grid.hexRectangleWidth),
                    nscreenX = nhexX * grid.hexRectangleWidth + ((nhexY % 2) * grid.hexRadius),
                    nscreenY = nhexY * (grid.hexHeight + grid.sideLength);
                grid.drawHexagon(nscreenX, nscreenY, true, grid.cellColors[nCell.type], nCell.owner);
            })
            if (grid.line) {
                grid.addLine(grid.line.start, grid.line.end)
            } else if (grid.isDragging) {
                grid.addLine(grid.isDragging, { x: x, y: y });
            }

        });
        grid.canv.addEventListener('mousedown', (eventInfo) => {
            const x = eventInfo.offsetX || eventInfo.layerX,
                y = eventInfo.offsetY || eventInfo.layerY,
                cent = grid.xyToCellCenter(x, y),
                cell = grid.getCellAtPoint(cent.x, cent.y);
            grid.line = null;
            grid.isDragging = cent;
            console.log('START ON CELL', cell)
        });
        grid.canv.addEventListener('mouseup', (eventInfo) => {
            const x = eventInfo.offsetX || eventInfo.layerX,
                y = eventInfo.offsetY || eventInfo.layerY,
                cent = grid.xyToCellCenter(x, y),
                cell = grid.getCellAtPoint(cent.x, cent.y);
            if (cent.x != grid.isDragging.x || cent.y != grid.isDragging.y) {
                grid.line = { start: grid.isDragging, end: cent };
            } else {
                grid.line = null;
            }
            grid.isDragging = false;
            grid.drawBoard();
        });
    }

}

export default hexGrid;
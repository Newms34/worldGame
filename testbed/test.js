
//canvID, side length, boardWidth, boardHeight
const makeCells = (bw, bh) => {
    return cellArr = new Array(bh).fill(100).map((cr, h) => {
        return new Array(bw).fill(100).map((cc, w) => {
            const isWater = Math.random()>.4,
            	type = isWater?0:Math.ceil(Math.random()*2);
            return new gridCell(h, w, type, [], 'Dave')
        })
    })
}

const prepCanv = (grid) => {
    console.log('preparing canvas!', grid.canv)
    grid.canv.addEventListener("mousemove", function(eventInfo) {
        let x,
            y,
            hexX,
            hexY,
            screenX,
            screenY
        ctx = grid.canv.getContext('2d');

        x = eventInfo.offsetX || eventInfo.layerX;
        y = eventInfo.offsetY || eventInfo.layerY;


        hexY = Math.floor(y / (grid.hexHeight + grid.sideLength));
        hexX = Math.floor((x - (hexY % 2) * grid.hexRadius) / grid.hexRectangleWidth);

        screenX = hexX * grid.hexRectangleWidth + ((hexY % 2) * grid.hexRadius);
        screenY = hexY * (grid.hexHeight + grid.sideLength);

        ctx.clearRect(0, 0, grid.canv.width, grid.canv.height);

        //we draw the full board, THEN redraw the hovered hex (if any)
        grid.drawBoard(ctx, grid.boardWidth, grid.boardHeight);

        // Check if the mouse's coords are on the board
        if (hexX >= 0 && hexX < grid.boardWidth) {
            if (hexY >= 0 && hexY < grid.boardHeight) {
                // ctx.strokeStyle = "#ccc";
                console.log(hexX,hexY,grid.cells[hexY][hexX]);
                grid.drawHexagon(screenX, screenY, true, grid.cellColors[grid.cells[hexY][hexX].type]);
            }
        }
    });
}

class gridCell {
    constructor(x, y, type, contents, owner) {
        this.x = x;
        this.y = y;
        this.type = type,
            this.contents = contents;
        this.owner = owner || null;
    }
}

class hexGrid {
    constructor(canvId, sl) {
        this.canv = document.getElementById(canvId);
        this.width = screen.width*1.3;
        this.height = screen.height*2;
        this.canv.style.width = this.width + 'px';
        this.canv.style.height = this.height + 'px';
        this.canv.width = this.width;
        this.canv.height = this.height;
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
        this.cellColors = ['#009', '#393', '#fca'];
        //now we should have the number of cells on the board
        this.cells = makeCells(this.boardWidth, this.boardHeight);
        prepCanv(this);
    }
    drawHexagon(x, y, hover, color) {
        const ctx = this.canv.getContext('2d');
        ctx.fillStyle = color || '#393';
        if (hover) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
        } else {
            ctx.lineWidth = 0;
            ctx.strokeStyle = 'none';
        }
        ctx.beginPath();
        ctx.moveTo(x + this.hexRadius, y);
        ctx.lineTo(x + this.hexRectangleWidth, y + this.hexHeight);
        ctx.lineTo(x + this.hexRectangleWidth, y + this.hexHeight + this.sideLength);
        ctx.lineTo(x + this.hexRadius, y + this.hexRectangleHeight);
        ctx.lineTo(x, y + this.sideLength + this.hexHeight);
        ctx.lineTo(x, y + this.hexHeight);
        ctx.closePath();
        ctx.fill();
        if (hover) {
            ctx.stroke();
        }
    }
    drawBoard() {
        const that = this;
        this.cells.forEach((cr, y) => {
            cr.forEach((ci, x) => {
                const celCol = that.cellColors[ci.type];
                // i * hexRectangleWidth + ((j % 2) * hexRadius),
                // j * (sideLength + hexHeight),
                this.drawHexagon((x * that.hexRectangleWidth + ((y % 2) * that.hexRadius)), (y * (that.sideLength + that.hexHeight)), false, celCol)
            })
        })
    }
}
var hgWells = new hexGrid('hexmap', 30)
console.log(hgWells, hgWells.drawHexagon)
hgWells.drawBoard();
// hgWells.drawHexagon(1,2,false,'#900')
// doCanv(cells);
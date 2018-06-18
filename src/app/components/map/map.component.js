import template from './map.html';
import mapFac from './mapfactory';

const mapComponent = {
  template,
  controller: class mapComponent {
  	constructor(){
  		this.user = 'Dave';
  		this.otherPlayers = ['Bob','Emily']
  		this.map = new mapFac('hexgrid',20,this.user,null, this.otherPlayers.concat([this.user]));
  		// this.map.cellList = this.cells;
  	}
  	$onInit(){
  		console.log(this.map.cellList);
  		// this.map.canv.addEventListener('click',(eventInfo)=>{
  		// 	console.log('MAP CLICKED!',eventInfo)
  		// 	const x = eventInfo.offsetX || eventInfo.layerX,
    //         y = eventInfo.offsetY || eventInfo.layerY;
    //         console.log('CELL IS',this.map.getOneCell(x,y))
  		// })
  	}
  },
  controllerAs:'vm',
};

export default mapComponent;

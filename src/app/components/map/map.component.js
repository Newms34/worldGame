import template from './map.html';
import mapFac from './mapfactory';

const mapComponent = {
    template,
    controller: class mapComponent {
        constructor($http) {
            this.user = 'Dave';
            this.$http = $http;
            this.otherPlayers = ['Bob', 'Emily']
            this.map = new mapFac('hexgrid', 20, this.user, null, this.otherPlayers.concat([this.user]));
            // this.map.cellList = this.cells;
        }
        $onInit() {
            console.log(this.map.cellList);
            // this.map.canv.addEventListener('click',(eventInfo)=>{
            //  console.log('MAP CLICKED!',eventInfo)
            //  const x = eventInfo.offsetX || eventInfo.layerX,
            //         y = eventInfo.offsetY || eventInfo.layerY;
            //         console.log('CELL IS',this.map.getOneCell(x,y))
            // })
        }
        attack(att,def,ranged){
          const {$http} = this;
          $http.get(`/games/diploStat?att=${att.owner}&def=${def.owner}`)
          .then(c=>{
            if (c!='war'){
              return {status:'noWar',ok:false}
            }else{
              $http.post('/games/fight',{
                att:att,
                def:def,
                isRanged:ranged
              })
              .then(gr=>{
                console.log('attack complete; game now',gm)
              })
            }
          })
        }
    },
    controllerAs: 'mc',
};

export default mapComponent;
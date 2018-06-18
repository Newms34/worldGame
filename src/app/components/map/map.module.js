import mapComponent from './map.component';

const map = angular
  .module('components.map', [])
  .component('map', mapComponent)
  .config(($stateProvider) => {
    'ngInject';
    $stateProvider
      .state('map', {
        url: '/map',
        component: 'map',
      });
  })
  .name;

export default map;

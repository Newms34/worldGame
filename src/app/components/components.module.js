import angular from 'angular';
// import auth from './auth/auth.module';
import map from './map/map.module';

const ComponentsModule = angular
  .module('app.components', [
    // auth,
    map,
  ])
  .name;

export default ComponentsModule;

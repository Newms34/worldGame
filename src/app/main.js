import angular from 'angular';
import ngAnimate from 'angular-animate';
import uiRouter from 'angular-ui-router';
import AppComponent from './main.component';
import ComponentsModule from './components/components.module';
// import CommonModule from './common/common.module';
import '../style/app.scss';

const AppModule = angular
    .module('app', [
        uiRouter,
        ComponentsModule,
        // CommonModule,
        ngAnimate,
    ])
    .component('app', AppComponent)
    .config(($locationProvider, $urlRouterProvider, $httpProvider) => {
        'ngInject';
        $locationProvider.html5Mode(true).hashPrefix('!');

        $httpProvider.interceptors.push(($q => ({
            request: (config) => {
                config.url = config.url[0] === '/' ? baseURI + config.url : config.url;
                return config || $q.when(config);
            },
        })));
        $httpProvider.defaults.withCredentials = true;
    })
    .name;

console.log('APP MODULE', AppModule, uiRouter, angular, ngAnimate)
export default AppModule;
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'explorer',
      component: () => import('./views/Explorer.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('./views/About.vue')
    },
    {
      path: '/uuid/:uuid',
      name: 'uuid',
      component: () => import('./views/UUID.vue')
    },
    {
      path: '/address/:address',
      name: 'address',
      component: () => import('./views/Address.vue')
    },
    {
      path: '/block/:block',
      name: 'block',
      component: () => import('./views/Block.vue')
    },
    {
      path: '/manent/:uuid/:privkey',
      name: 'manent',
      component: () => import('./views/Manent.vue')
    }
  ]
})

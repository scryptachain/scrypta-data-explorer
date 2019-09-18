<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <div v-if="isLoading" style="padding:45vh 0">
          Loading data, please wait...
        </div>
        <div v-if="!isLoading" style="width: 100%; margin-top:20px">
          <h5 style="margin-top:20px">Raw block details {{ $route.params.block }}</h5>
          <div class="card" style="width: 100%; margin-top:20px">
            <div class="card-body">
              <pre style="text-align:left">{{ block }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'Explorer',
  data () {
    return {
      idanode: 'https://idanodejs01.scryptachain.org',
      axios: axios,
      isLoading: true,
      block: {}
    }
  },
  async mounted() {
    const app = this
    let check = await app.axios.get(app.idanode + '/wallet/getinfo').catch(err => {
      console.log(err)
      alert('There\'s an error on IdaNode, please retry!')
    })
    if(check.data.blocks > 0){
      let readreturn = await app.axios.get(app.idanode + '/block/' + app.$route.params.block).catch(err => {
        console.log(err)
        alert('There\'s an error on IdaNode, please retry!')
      })
      app.block = readreturn.data.data
      app.isLoading = false
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

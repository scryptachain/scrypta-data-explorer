<template>
  <div id="app">
    <b-navbar toggleable="lg" style="text-align:left; position:fixed; top:0; left:0; width:100%; z-index:999; background:#333!important; font-size:12px;" type="dark" variant="primary">
      <b-navbar-brand href="/#/" style="display:inline-block;margin:0 auto; font-size:12px!important;"><img src="./assets/logo.png" height="20" style="float:left; font-size:12px!important; margin-right:10px;">Proof - Blockchain Data Explorer</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item target="_blank" href="https://scrypta.wiki">Docs</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <router-view style="margin-top:50px;"/>
    <hr class="hide-print">
    <span class="hide-print" style="font-size:11px">Scrypta Proof is an open-source project by Scrypta Task Force</span>
    <br><br>
  </div>
</template>

<style>
  #app {
    font-family: 'Roboto Mono';
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #fff;
    background: #222;
  }
  .card{
    background:#222!important;
    color:#ddd!important;
  }
  pre{
    color:#ddd!important;
  }
  .btn-primary{
    background: #d8213b!important;
    border-color: #d8213b!important;
    color:#fff!important;
  }
  a{
    color: #d8213b!important;
  }
  nav a{
    color:#ddd!important;
  }
</style>

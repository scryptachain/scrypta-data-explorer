<template>
  <div id="app">
    <b-navbar toggleable="lg" style="text-align:center" type="dark" variant="primary">
      <b-navbar-brand href="/#/" style="display:inline-block;margin:0 auto;"><img src="./assets/logo.png" height="30" style="float:left; margin-right:10px;">Proof</b-navbar-brand>

      <!--<b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item href="/#/">Explorer</b-nav-item>
          <b-nav-item href="/#/about">About</b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">
          <b-nav-form>
            <b-form-input size="md" class="mr-sm-4" style="font-size:12px" placeholder="Address or UUID"></b-form-input>
            <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
          </b-nav-form>
        </b-navbar-nav>
      </b-collapse>-->
    </b-navbar>
    <router-view/>
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
    color: #2c3e50;
  }
</style>

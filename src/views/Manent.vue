<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <div class="show-print">
          <img src="../assets/logo.png" width="100" style="margin-bottom:20px" />
        </div>
        <h5 style="margin-top:20px">
          This data have been notarized with
          <b>Manent Mail</b>
          <br v-if="data.data.provider" />
          <span v-if="data.data.provider" style="font-size:15px">using provider {{ data.data.provider }}</span>
        </h5>
        <div v-if="isLoading" style="padding:45vh 0 0 0">Loading data, please wait...</div>
        <div v-if="!isLoading" class="card" style="width: 100%; margin-top:20px">
          <div class="card-body">
            <h5
              class="card-title"
              v-if="data.title !== undefined && data.title !== 'undefined' && data.title !== ''"
            >{{ data.title }}</h5>
            <h5
              class="card-title"
              v-if="data.refID !== undefined && data.refID !== 'undefined' && data.refID !== ''"
            >{{ data.refID }}</h5>
            <div v-if="data.data.plaintext">{{ data.data.plaintext }}</div>
            <div style="text-align:center">
              Notarization identifier is <a href="#">{{ data.uuid }}</a>
              <br />Blockchain address is
              <a href = "#">{{ data.address }}</a>
              <br />Notarized at block
              <a :href="'/#/block/' + data.block">{{ data.block }}</a>
              <br />
              Timestamped on {{ extdate }}
              <hr />User is identified with hash
              <b>{{ data.data.sender }}</b>
              <br />
              <br />
              <div class="row">
                <div class="col-sm-10">
                  <b-form-input
                    v-model="calculatehash"
                    placeholder="Enter user identifier and check the hash"
                  ></b-form-input>
                </div>
                <div class="col-sm-2">
                  <b-button
                    variant="success"
                    style="width:100%;"
                    v-on:click="runHashCheck"
                  >Calculate</b-button>
                </div>
              </div>
              <br />
              <div v-if="calculatedhash">
                <b-alert
                  v-if="calculatedhash === data.data.sender"
                  variant="success"
                  show
                >You've successfully recognized the identifier written inside the blockchain.</b-alert>
                <b-alert
                  v-if="calculatedhash !== data.data.sender"
                  variant="danger"
                  show
                >Attention please, identifier doesn't matches. Please be sure you've written it correctly.</b-alert>
              </div>
              <hr />
              <b-card
                v-for="file in data.data.attachments"
                v-bind:key="file.hash"
                :title="file.name"
                tag="article"
                style="width: 100%; text-align:left; font-size:13px; position:relative"
                class="mb-2"
              >
                <b-card-text v-if="file.verified && file.decrypted">
                  Identified with hash
                  <b>
                    {{ file.hash }}.
                    <br />This file have been successfully
                    <b style="color:green">decrypted</b> and
                    <b style="color:green">verified</b>.
                  </b>
                </b-card-text>
                <b-button
                  class="mobile-relative"
                  style="position:absolute; top: 45px; right: 45px;"
                  v-if="file.verified && file.decrypted"
                  href="#"
                  variant="primary"
                  v-on:click="saveFile(file.hash)"
                >Download</b-button>
                <b-card-text v-if="!file.verified || !file.decrypted">
                  <span
                    style="color:#f00"
                  >Can't decrypt and verify file, please check if the file exists on Documenta Space.</span>
                </b-card-text>
              </b-card>
            </div>
          </div>
        </div>
        <br />
        <h5>Raw data explorer</h5>
        <div class="card" style="width: 100%; margin-top:20px">
          <div class="card-body">
            <pre style="text-align:left">{{ data }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media screen and (max-width: 1023px) {
  .mobile-relative {
    position: relative !important;
    top: 0px !important;
    right: 0px !important;
  }
}
</style>
<script>
import axios from "axios";
const LZUTF8 = require("lzutf8");
const FileType = require("file-type/browser");
const ScryptaCore = require("@scrypta/core");
const crypto = require("crypto");

export default {
  name: "Explorer",
  data() {
    return {
      idanode: "https://idanodejs01.scryptachain.org",
      axios: axios,
      isLoading: true,
      isDecrypting: false,
      scrypta: new ScryptaCore(true),
      data: {},
      buffers: {},
      names: {},
      mimes: {},
      calculatehash: "",
      calculatedhash: "",
      decryptPwd: "",
      extdate: "",
      imgb64: "",
    };
  },
  async mounted() {
    const app = this;
    app.idanode = await window.ScryptaCore.connectNode();
    let check = await app.axios.get(app.idanode + "/wallet/getinfo");
    if (check.data.blocks > 0) {
      let readreturn = await app.axios.post(app.idanode + "/read", {
        uuid: app.$route.params.uuid,
      });
      for (let i in readreturn.data.data) {
        if (readreturn.data.data[i].uuid !== undefined) {
          let refID = LZUTF8.decompress(readreturn.data.data[i].refID, {
            inputEncoding: "Base64",
          });
          app.data = readreturn.data.data[i];
          if (app.data.protocol !== "manent://") {
            alert("Protocol doesn't matches, redirecting!");
            window.location = "/#/uuid/" + app.$route.params.uuid;
          }
          if (
            app.data.data.plaintext !== undefined &&
            app.data.data.plaintext !== ""
          ) {
            app.data.data.plaintext = LZUTF8.decompress(
              app.data.data.plaintext,
              { inputEncoding: "Base64" }
            );
          }
          if (
            app.data.data.attachments !== undefined &&
            app.data.data.attachments.length > 0
          ) {
            for (let k in app.data.data.attachments) {
              app.data.data.attachments[k].name = LZUTF8.decompress(
                app.data.data.attachments[k].name,
                { inputEncoding: "Base64" }
              );
              try {
                let url =
                  "https://scrypta.sfo2.digitaloceanspaces.com/manent/" +
                  app.data.data.attachments[k].hash;
                let original = await app.axios.get(url, {
                  responseType: "arraybuffer",
                });
                let decrypted = await app.scrypta.decryptFile(
                  original.data,
                  app.$route.params.privkey,
                  true
                );
                if (decrypted !== false) {
                  app.data.data.attachments[k].decrypted = true;
                  app.buffers[app.data.data.attachments[k].hash] = decrypted;
                  let ft = await FileType.fromBuffer(decrypted);
                  app.data.data.attachments[k].filetype = ft;
                  app.mimes[app.data.data.attachments[k].hash] = ft.mime;
                  app.names[app.data.data.attachments[k].hash] =
                    app.data.data.attachments[k].name;
                } else {
                  app.data.data.attachments[k].decrypted = false;
                }
                let checkhash = crypto
                  .createHash("sha256")
                  .update(decrypted)
                  .digest("hex");
                if (checkhash === app.data.data.attachments[k].hash) {
                  app.data.data.attachments[k].verified = true;
                } else {
                  app.data.data.attachments[k].verified = false;
                }
              } catch (e) {
                console.log(e);
                alert("Can't retrieve original file!");
              }
            }
          }
          app.data.refID = refID;
          let time = app.data["time"] * 1000;
          app.extdate = new Date(time).toUTCString();
          delete app.data["id"];
        }
      }
      app.isLoading = false;
    }
  },
  methods: {
    runHashCheck() {
      const app = this;
      let checkhash = crypto
        .createHash("sha256")
        .update(app.calculatehash)
        .digest("hex");
      app.calculatedhash = checkhash;
    },
    saveFile(hash) {
      const app = this;
      var blob = new Blob([app.buffers[hash]], { type: app.mimes[hash] });
      var link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      var fileName = app.names[hash];
      link.download = fileName;
      link.click();
    },
  },
};
</script>

<style>
.show-print {
  display: none;
}
@media print {
  .hide-print {
    display: none !important;
  }
  .show-print {
    display: block !important;
  }
  pre {
    border: 0;
  }
}
</style>

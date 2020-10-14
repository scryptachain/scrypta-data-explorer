<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <div class="show-print">
          <img src="../assets/logo.png" width="100" style="margin-bottom:20px" />
        </div>
        <h5 style="margin-top:20px; font-size:18px">
          This data have been notarized
          <br v-if="data.provider !== undefined" />
          <span v-if="data.provider !== undefined" style="font-size:18px">
            using provider
            <br />
            <span v-if="providers[data.provider] !== undefined" style="font-size:20px">
              <br />
              <b>{{ providers[data.provider] }}</b>
            </span>
            <br />
            <b
              style="font-size:11px"
            >{{ data.provider.substr(0,6) }}...{{ data.provider.substr(-6) }}</b>
          </span>
        </h5>
        <div v-if="isLoading" style="padding:20vh 0">Loading data, please wait...</div>
        <div
          v-if="!isLoading && data.data !== undefined"
          class="card"
          style="width: 100%; margin-top:20px"
        >
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
              Notarization identifier is
              <a href="#">{{ data.uuid }}</a>
              <br />Blockchain address is
              <a :href="'/#/address/' + data.address">{{ data.address }}</a>
              <br />Notarized at block
              <a :href="'/#/block/' + data.block">{{ data.block }}</a>
              <br />
              Timestamped on {{ extdate }}
              <hr />User is identified with hash
              <b>{{ data.data.identity }}</b>
              <br />
              <br />
              <div class="row" v-if="!calculatedhash">
                <div class="col-md-10">
                  <b-form-input
                    v-model="calculatehash"
                    placeholder="Enter user identifier and check the hash"
                  ></b-form-input>
                </div>
                <div class="col-md-2">
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
                  v-if="calculatedhash === data.data.identity"
                  variant="success"
                  show
                >You've successfully recognized the identifier written inside the blockchain.</b-alert>
                <b-alert
                  v-if="calculatedhash !== data.data.identity"
                  variant="danger"
                  show
                >Attention please, identifier doesn't matches. Please be sure you've written it correctly.</b-alert>
              </div>
              <hr />
              <b-alert
                v-if="proved"
                variant="success"
                show
              >You've successfully recognized the owner!</b-alert>
              <b-button
                v-b-modal.modal-id
                variant="info"
                v-if="!proved"
                v-on:click="startOwnershipProof"
              >Prove ownership of the address</b-button>
              <b-modal v-if="!proved" id="modal-id" title="Prove ownership of the address">
                <p class="my-4" style="text-align:center">
                  Please ask the owner to open its Manent App and scan the QR code with the
                  <b>remote sign</b> feature.
                </p>
                <vue-qrcode :value="'ownership:' + ownershipAddress" style="width:100%" />
              </b-modal>
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
                    <b style="color:green">verified</b> from Documenta Space.
                  </b>
                  <br />
                  <br />
                  <div v-if="!verified[file.hash]">
                    <span>Please use box above to manually verify your local copy of the file:</span>
                    <br />
                    <br />
                    <b-form-group
                      label="Verify local file:"
                      label-for="file-small"
                      label-cols-sm="2"
                      label-size="sm"
                      v-if="!isVerifying"
                    >
                      <b-form-file
                        :id="'file-' + file.hash"
                        v-model="checks[file.hash]"
                        v-on:input="readFile(file.hash)"
                        size="sm"
                      ></b-form-file>
                    </b-form-group>
                    <div v-if="isVerifying">Verifying local file, please wait...</div>
                  </div>
                  <div v-if="verified[file.hash]">
                    <span
                      style="color:green"
                    >You've successfully verified the file!</span>
                  </div>
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
                  <div v-if="!verified[file.hash]">
                    <span
                      style="color:#f00"
                    >Can't automatically decrypt and verify file, please use the box above to manually verify your local copy:</span>
                    <br />
                    <br />
                    <b-form-group
                      label="Verify local file:"
                      label-for="file-small"
                      label-cols-sm="2"
                      label-size="sm"
                      v-if="!isVerifying"
                    >
                      <b-form-file
                        :id="'file-' + file.hash"
                        v-model="checks[file.hash]"
                        v-on:input="readFile(file.hash)"
                        size="sm"
                      ></b-form-file>
                    </b-form-group>
                    <div v-if="isVerifying">Verifying local file, please wait...</div>
                  </div>
                  <div v-if="verified[file.hash]">
                    <span
                      style="color:green"
                    >You've successfully verified the file!</span>
                  </div>
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
import VueQrcode from "vue-qrcode";

export default {
  name: "Explorer",
  components: {
    VueQrcode,
  },
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
      ownershipAddress: "",
      mimes: {},
      providers: {
        "029c6bb0eb43def26887c596f0a3beaf9b5189c4fe3e575a4965c25fba250ac794":
          "Scrypta Manent Mail (Free Service)",
      },
      calculatehash: "",
      error: "",
      calculatedhash: "",
      decryptPwd: "",
      proved: false,
      extdate: "",
      isVerifying: false,
      checks: {},
      verified: {},
      imgb64: "",
    };
  },
  async mounted() {
    const app = this;
    localStorage.setItem("messages", "[]");
    app.idanode = await window.ScryptaCore.connectNode();
    let check = await app.axios.get(app.idanode + "/wallet/getinfo");
    if (check.data.blocks > 0) {
      let readreturn = await app.axios.post(app.idanode + "/read", {
        uuid: app.$route.params.uuid,
      });
      for (let i in readreturn.data.data) {
        if (readreturn.data.data[i].uuid !== undefined) {
          app.data = readreturn.data.data[i];
          if (app.data.protocol !== "manent://") {
            alert("Protocol doesn't matches, redirecting!");
            window.location = "/#/uuid/" + app.$route.params.uuid;
          }
          let verify = await app.scrypta.verifyMessage(
            app.data.data.pubkey,
            app.data.data.signature,
            app.data.data.message
          );
          if (verify !== false) {
            app.data.provider = app.data.data.pubkey;
            app.data.fingerprint = app.data.data.signature;
            app.data.data = JSON.parse(app.data.data.message);
            if (
              app.data.data.plaintext !== undefined &&
              app.data.data.plaintext !== ""
            ) {
              app.data.data.plaintext = LZUTF8.decompress(
                app.data.data.plaintext,
                { inputEncoding: "Base64" }
              );
            }

            if(app.data.data.subject){
              app.data.data.subject = LZUTF8.decompress(
                app.data.data.subject,
                { inputEncoding: "Base64" }
              )
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
                    app.data.address +
                    "/" +
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
                  alert("Can't retrieve original file!");
                }
              }
            }
            let time = app.data["time"] * 1000;
            app.extdate = new Date(time).toUTCString();
            delete app.data["_id"];
          } else {
            alert("Can't verify provider signature!");
          }
        }
      }
      app.isLoading = false;
    }
  },
  methods: {
    async startOwnershipProof() {
      const app = this;
      app.scrypta.staticnodes = true;
      let newaddress = await app.scrypta.createAddress("new", false);
      app.ownershipAddress = newaddress.pub;
      app.scrypta.connectP2P(function (data) {
        try {
          let object = JSON.parse(data.message);
          if (
            object.request === newaddress.pub &&
            object.protocol === "ownership://"
          ) {
            if (data.address === app.data.address) {
              alert("Ownership proved!");
              app.proved = true;
            } else {
              alert("This address isnt't the owner!");
            }
          }
        } catch (e) {
          app.error = e;
        }
      });
    },
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
    readFile(file) {
      const app = this;
      app.isVerifying = true;
      return new Promise((response) => {
        var reader = new FileReader();
        reader.onload = function (event) {
          var readed = event.target.result;
          let hash = crypto
            .createHash("sha256")
            .update(new Uint8Array(readed))
            .digest("hex");
          if (file === hash.toString()) {
            app.verified[file] = {
              hash: hash,
              filename: file.name,
              size: file.size,
              lastModified: file.lastModified,
              type: file.type,
            };
            app.isVerifying = false;
            response(true);
          } else {
            app.isVerifying = false;
            response(false);
          }
        };

        reader.readAsArrayBuffer(app.checks[file]);
      });
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

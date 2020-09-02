<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <div class="show-print">
          <img src="../assets/logo.png" width="100" style="margin-bottom:20px" />
        </div>
        <h5 style="margin-top:20px">
          Proof of Existence for
          <br />
          <span style="font-size:15px">{{ $route.params.uuid }}</span>
        </h5>
        <div v-if="isLoading" style="padding:45vh 0 0 0">Loading data, please wait...</div>
        <div class="show-print" style="margin-top:30px">
          This data have been timestamped using Scrypta Blockchain and
          <br />is maintained over the Scrypta Network.
          <br />
          <div v-if="data.protocol === 'E://'">
            <br />This data have been crypted using an AES-256 algorithm.
          </div>
          <br />All the informations below can be fetched directly from
          <br />the blockchain or using the IdANode technology.
          <br />
          <br />
          The owner of the address {{ data.address }}
          <br />that owns the relative private key is the legal owner of this data.
        </div>
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
            <div v-if="data.mime">
              <img
                :src="idanode + '/ipfs/' + data.data"
                width="100%"
                style="margin-bottom:15px"
                v-if="data.mime.type === 'image'"
              />
            </div>
            <div v-if="imgb64">
              <img :src="imgb64" v-if="imgb64" style="margin-bottom:15px" width="100%" />
            </div>
            <div v-if="data.is_file === true">
              IPFS hash:
              <a :href="idanode + '/ipfs/' + data.data" target="_blank">{{data.data}}</a>
              <br />
            </div>
            <div v-if="data.mime">
              <span v-if="data.mime.mime">
                File Type: {{ data.mime.mime.toUpperCase() }}
                <br />
              </span>
            </div>
            <p v-if="data.is_file === false" class="card-text">{{ data.data }}</p>
            <div style="text-align:center">
              UUID is
              <a :href="'/#/uuid/' + data.uuid">{{ data.uuid }}</a>
              <br />Written by
              <a :href="'/#/address/' + data.address">{{ data.address }}</a>
              at block
              <a :href="'/#/block/' + data.block">{{ data.block }}</a>
              <br />
              Timestamped on {{ extdate }}
            </div>
            <br class="hide-print" />
            <br class="hide-print" />
            <div style="text-align:center">
              <div class="btn btn-success hide-print" v-on:click="print()">PRINT CERTIFICATE</div>
            </div>
            <hr />
            <b-alert v-if="proved" variant="success" show>You've successfully recognized the owner!</b-alert>
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
            <br class="hide-print" />
            <div v-if="data.protocol === 'E://'" class="hide-print">
              <hr />This
              <span v-if="data.is_file === true">file</span>
              <span v-if="data.is_file === false">data</span> is encrypted.
              <br />Write password to reveal decrypted
              <span v-if="data.is_file === true">file</span>
              <span v-if="data.is_file === false">data</span>:
              <br />
              <br />
              <b-form-input
                v-model="decryptPwd"
                type="password"
                placeholder="Enter decryption password"
              ></b-form-input>
              <br />
              <div v-if="!isDecrypting">
                <div
                  v-if="data.is_file === true"
                  class="btn btn-primary"
                  v-on:click="decryptFile()"
                >DECRYPT FILE</div>
                <div
                  v-if="data.is_file === false"
                  class="btn btn-primary"
                  v-on:click="decryptData()"
                >DECRYPT DATA</div>
              </div>
              <div v-if="isDecrypting">Decrypting, please wait...</div>
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

<script>
import axios from "axios";
const fileType = require("file-type");
const ScryptaCore = require("@scrypta/core");
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
      fileType: fileType,
      ownershipAddress: "",
      proved: false,
      scrypta: new ScryptaCore(true),
      data: {},
      decryptPwd: "",
      extdate: "",
      imgb64: "",
    };
  },
  async mounted() {
    const app = this;
    app.idanode = await window.ScryptaCore.connectNode();
    localStorage.setItem("messages", "[]");
    let check = await app.axios.get(app.idanode + "/wallet/getinfo");
    if (check.data.blocks > 0) {
      let readreturn = await app.axios.post(app.idanode + "/read", {
        uuid: app.$route.params.uuid,
      });
      for (let i in readreturn.data.data) {
        if (readreturn.data.data[i].uuid !== undefined) {
          if (readreturn.data.data[i].is_file === true) {
            let mime = await app.axios.get(
              app.idanode + "/ipfs/type/" + readreturn.data.data[i].data
            );
            readreturn.data.data[i].mime = mime.data.data;
            app.data = readreturn.data.data[i];
          } else {
            app.data = readreturn.data.data[i];
          }
          let time = app.data["time"] * 1000;
          app.extdate = new Date(time).toUTCString();
          delete app.data["id"];
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
    print() {
      window.print();
    },
    decryptFile() {
      const app = this;
      if (app.isDecrypting === false && app.decryptPwd.length > 0) {
        app.isDecrypting = true;
        app.axios
          .get(app.idanode + "/ipfs/buffer/" + app.data.data)
          .then((ipfs) => {
            let data = ipfs.data.data[0].content.data;
            window.ScryptaCore.decryptFile(data, app.decryptPwd).then(
              async (decrypted) => {
                if (decrypted !== false) {
                  let type = await app.fileType.fromBuffer(decrypted);
                  app.data.protocol = "";
                  var saveByteArray = (function () {
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.style = "display: none";
                    return function (data, name) {
                      var blob = new Blob(data, { type: "octet/stream" });
                      let mimexp = type.mime.split("/");
                      if (mimexp[0] === "image") {
                        var reader = new FileReader();
                        reader.onload = function () {
                          var bdata = btoa(reader.result);
                          var datauri =
                            "data:" + type.mime + ";base64," + bdata;
                          app.imgb64 = datauri;
                        };
                        reader.readAsBinaryString(blob);
                      } else {
                        var url = window.URL.createObjectURL(blob);
                        a.href = url;
                        a.download = name;
                        a.click();
                        window.URL.revokeObjectURL(url);
                      }
                      app.isDecrypting = false;
                    };
                  })();

                  saveByteArray([decrypted], app.data.data + "." + type.ext);
                } else {
                  app.isDecrypting = false;
                  alert("Wrong password!");
                }
              }
            );
          });
      }
    },
    decryptData() {
      const app = this;
      window.ScryptaCore.decryptData(app.data.data, app.decryptPwd).then(
        (decrypted) => {
          if (decrypted !== false) {
            app.data.data = decrypted;
            app.data.protocol = "";
          } else {
            alert("Wrong password!");
          }
        }
      );
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

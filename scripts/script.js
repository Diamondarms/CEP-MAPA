var colunas = {
  nome: "table-cell",
  estado: "table-cell",
  municipio: "table-cell",
  bairro: "table-cell",
  rua: "none",
  cep: "none",
  label: "block",
};

const ceps = [
  "28944-030",
  "56903-490",
  "12041-078",
  "13234-645",
  "94828-310",
  "54505-465",
  "73805-625",
  "76870-363",
  "17209-250",
  "26135-080",
  "68017-035",
  "64800-026",
  "35680-315",
  "64025-400",
  "24110-809",
  "16200-312",
  "85602-530",
  "24906-000",
  "44434-496",
  "16902-662",
  "26550-050",
  "83215-520",
  "75382-331",
  "38303-096",
  "29162-200",
  "88104-365",
  "11600-409",
  "13398-728",
  "19910-471",
  "13665-457",
  "17058-531",
];

$(document).ready(function () {
  $("#cep").mask("00000-000");
});

const markers_div = document.getElementById("markers");

var map = L.map("map").setView([-15.811648, -47.943887], 4);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

var markers = {};
var markers_s = {};
var markerCounter = 0;
var lat_p = 0,
  lat_n = 0,
  lon_p = 0,
  lon_n = 0;
var label_h = 20;

L.control.browserPrint({position: 'topleft'}).addTo(map);

$('#cep').on('keydown', function (e) {
  if (e.keyCode === 13) {
    add_marker();
  }
})

$('#nome').on('keydown', function (e) {
  if (e.keyCode === 13) {
    if(document.getElementById("cep").value == "")
      document.getElementById("cep").focus();
    else
      add_marker();
  }
})

async function add_marker() {
  const cep = document.getElementById("cep").value;
  const nome = document.getElementById("nome").value;

  document.getElementById("cep").value = "";

  if(verifica_se_repete(cep)){
    alert("O CEP inserido já está presente no mapa")
    return;
  }
  if(cep == ""){
    alert("Insira um CEP")
    return;
  }

  document.getElementById("nome").value = "";

  const response = await fetch("https://cep.awesomeapi.com.br/json/" + cep);
  const data = await response.json();

  if(data.code){
    alert("CEP Inválido")
    return;
  }

  const state = data.state;
  const city = data.city;
  const district = data.district;
  const address = data.address;

  const circleIcon = L.divIcon({
    html:
      '<i class="bi bi-circle-fill icones" style="font-size: ' +
      document.getElementById("Rang").value +
      "px; color: " +
      document.getElementById("color_icon").value +
      '; text-shadow: 2px 2px 4px rgba(0,0,0,0.28);"></i>',
    className: "custom-div-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

  const markerId = `marker${markerCounter++}`;
  markers[markerId] = L.marker([data.lat, data.lng], {
    icon: circleIcon,
  }).addTo(map);

  const label = document.createElement("div");
  if(nome != ""){
    label.className = "marker-label label badge bg-light p2"; // COLOCAR ALGO PARA CONSEGUIR DAR HIDEOUS DEPOIS
    label.style.display = colunas["label"];
    label.innerText = nome;
  }

  map.getPanes().overlayPane.appendChild(label);

  markers_div.innerHTML += `<tr id="${markerId}">
                                    <td class="nome align-middle" style="display: ${colunas["nome"]}">${nome} </td>
                                    <td class="estado align-middle" style="display: ${colunas["estado"]}"> ${state} </td>
                                    <td class="municipio align-middle" style="display: ${colunas["municipio"]}"> ${city} </td>
                                    <td class="bairro align-middle" style="display: ${colunas["bairro"]}"> ${district} </td>
                                    <td class="rua align-middle" style="display: ${colunas["rua"]}"> ${address} </td>
                                    <td class="cep align-middle" style="display: ${colunas["cep"]}"> ${cep} </td>
                                    <td class="text-end align-middle">
                                        <button class="btn" onclick="exclude('${markerId}')" style="padding: 0.25rem 0.5rem;">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>`;

  markers_s[markerId] = {
    markerid: markerId,
    lat: data.lat,
    lon: data.lng,
    label: label,
    c: cep
  };

  verifica_lonlat();

  const markerPos = map.latLngToLayerPoint([data.lat, data.lng]);
  label.style.left = `${markerPos.x}px`;
  label.style.top = `${markerPos.y - label_h}px`;

  map.on("move", () => {
    const markerPos = map.latLngToLayerPoint([data.lat, data.lng]);
    label.style.left = `${markerPos.x}px`;
    label.style.top = `${markerPos.y - label_h}px`;
  });
}

function exclude(markerId) {
  if (markers[markerId]) {
    markers[markerId].remove();
    delete markers[markerId];
  }

  if (markers_s[markerId]) {
    if (markers_s[markerId].label) {
      markers_s[markerId].label.remove();
    }
    delete markers_s[markerId];
  }

  const markerDiv = document.getElementById(markerId);
  if (markerDiv) {
    markerDiv.remove();
  }

  verifica_lonlat();
}

function change_icon_size() {
  const icon_size = document.getElementById("Rang").value;

  const namesElements = document.querySelectorAll(".icones");

  namesElements.forEach(function (element) {
    element.style.fontSize = icon_size + "px";
  });
}

function verifica_se_repete(c){
  for (let markerId in markers) {
    if (markers_s[markerId]) {
      if (markers_s[markerId].c) {
        if (c == markers_s[markerId].c){
          return true;
        }
      }
    }
  }
  return false;
}

function change_icon_color() {
  const icon_color = document.getElementById("color_icon").value;

  const namesElements = document.querySelectorAll(".icones");

  namesElements.forEach(function (element) {
    element.style.color = icon_color;
  });
}

function change_label_h() {
  const label_h_chosed = document.getElementById("Rang2").value;

  label_h = label_h_chosed;

  for (let markerId in markers) {
    if (markers_s[markerId]) {
      if (markers_s[markerId].label) {
        const markerPos = map.latLngToLayerPoint([
          markers_s[markerId].lat,
          markers_s[markerId].lon,
        ]);
        markers_s[markerId].label.style.top = `${
          markerPos.y - label_h_chosed
        }px`;
      }
    }
  }
}

function hide_element(nome_) {
  const namesElements = document.querySelectorAll("." + nome_);

  colunas[nome_] =
    colunas[nome_] == "none"
      ? nome_ == "label"
        ? "block"
        : "table-cell"
      : "none";
  var sd = colunas[nome_];

  namesElements.forEach(function (element) {
    element.style.display = sd;
  });
}

function random_cep() {
  let c = ceps[Math.floor(Math.random() * ceps.length)];

  if(verifica_se_repete(c)){
    let i = 0;
    do {
      c = ceps[i++]
      if (i >= ceps.length){
        alert("Banco interno de CEPs vazio")
        return;
      }
    } while (verifica_se_repete(c));
  }

  document.getElementById("cep").value = c
}

async function random_name() {
  const response = await fetch("https://story-shack-cdn-v2.glitch.me/generators/brazilian-name-generator");
  const data = await response.json();

  document.getElementById("nome").value = data.data[Math.random() > 0.5 ? 'female' : 'male'] + " " + data.data['lastName'];
}

function delete_all() {
  for (let markerId in markers) {
    if (markers[markerId]) {
      markers[markerId].remove();
      delete markers[markerId];
    }

    if (markers_s[markerId]) {
      if (markers_s[markerId].label) {
        markers_s[markerId].label.remove();
      }
      delete markers_s[markerId];
    }

    const markerDiv = document.getElementById(markerId);
    if (markerDiv) {
      markerDiv.remove();
    }
  }

  markers = {};
  markers_div.innerHTML = "";
}

function verifica_lonlat() {
  let markerCount = Object.keys(markers_s).length;

  if (markerCount === 0) return;

  lat_p = -90;
  lat_n = 90;
  lon_p = -180;
  lon_n = 180;

  var map_size = document.getElementById("map");
  var map_res = map_size.offsetWidth / map_size.offsetHeight;

  for (let markerId in markers_s) {
    let marker = markers_s[markerId];
    let lat = parseFloat(marker.lat);
    let lon = parseFloat(marker.lon);
    if (lat > lat_p) lat_p = lat;
    if (lat < lat_n) lat_n = lat;
    if (lon > lon_p) lon_p = lon;
    if (lon < lon_n) lon_n = lon;
  }

  let centerLat = (lat_p + lat_n) / 2;
  let centerLon = (lon_p + lon_n) / 2;

  let d =
    Math.abs(lat_n - lat_p) < Math.abs(lon_n - lon_p) / map_res
      ? Math.abs(lon_n - lon_p) / map_res
      : Math.abs(lat_n - lat_p);

  map.setView([centerLat, centerLon], Math.log2(202.5 / d) + 1);
}

(() => {
  const mapElement = document.getElementById("isan-map");

  // ป้องกันสคริปต์ทำงานหากไม่มี Section แผนที่
  if (!mapElement || typeof L === "undefined") return;

  // พิกัดบางจุด เช่น ร้านอาหาร โรงแรม และแหล่งเกลือ
  // เป็นตำแหน่งประมาณ ต้องแก้เป็นพิกัดจริงก่อนใช้งานนำทาง
  const locations = [
    // DAY 1 — นครราชสีมา
    {
      day: 1,
      time: "06:00",
      name: "มหาวิทยาลัยศิลปากร วังท่าพระ",
      type: "start",
      lat: 13.7525,
      lng: 100.4899,
      description: "จุดเริ่มต้นการเดินทางจากกรุงเทพฯ",
    },
    {
      day: 1,
      time: "11:00",
      name: "วัดพระนอนธรรมจักรเสมาราม",
      type: "attraction",
      lat: 14.9167448,
      lng: 101.7936831,
      description: "โบราณสถานสำคัญในเมืองเสมา อำเภอสูงเนิน",
    },
    {
      day: 1,
      time: "12:00",
      name: "แซ่บนัวครัวศิริรัตน์",
      type: "meal",
      lat: 14.897410706427978, 
      lng: 101.84213671906286,
      description: "อาหารแซ่บ คนไม่กินเผ็ดต้องคอมเมนต์เป็นพิเศษ บรรยากาศร้านดี แต่แมงวี่เยอะไปหน่อย",
    },
    {
      day: 1,
      time: "14:00",
      name: "พิพิธภัณฑ์ไม้กลายเป็นหิน โคราชจีโอพาร์ค",
      type: "attraction",
      lat: 14.857839,
      lng: 102.027326,
      description: "พิพิธภัณฑ์ไม้กลายเป็นหิน จังหวัดนครราชสีมา",
    },
    {
      day: 1,
      time: "15:30",
      name: "ชุมชนเครื่องปั้นดินเผาด่านเกวียน",
      type: "attraction",
      lat: 14.851589,
      lng: 102.191534,
      description: "แหล่งเครื่องปั้นดินเผาที่มีชื่อเสียงของโคราช",
    },
    {
      day: 1,
      time: "15:30",
      name: "แหล่งผลิตเกลือบ้านพันดุง",
      type: "alternative",
      lat: 15.062353,
      lng: 101.950686,
      description: "ตัวเลือกแทนด่านเกวียน — ต้องยืนยันพิกัด",
    },
    {
      day: 1,
      time: "17:00",
      name: "อนุสาวรีย์ท้าวสุรนารี",
      type: "attraction",
      lat: 14.974796,
      lng: 102.098127,
      description: "แลนด์มาร์กสำคัญใจกลางเมืองโคราช",
    },
    {
      day: 1,
      time: "19:00",
      name: "โรงแรม ฟอร์จูน โคราช - คืนที่ 1",
      type: "hotel",
      lat: 14.978788201908886, 
      lng: 102.0908142296512,
      description: "เป็นโรงแรมที่มีการบริการที่ดีมากในโคราชน้องๆ ทุกคนมีservice mind ยิ้มทักทาย",
    },

    // DAY 2 — บุรีรัมย์
    {
      day: 2,
      time: "10:00",
      name: "อุทยานประวัติศาสตร์พนมรุ้ง",
      type: "attraction",
      lat: 14.53139,
      lng: 102.94222,
      description: "ปราสาทขอมโบราณบนภูเขาไฟที่ดับสนิท",
    },
    {
      day: 2,
      time: "12:00",
      name: "สวนหอมขนุน — บุรีรัมย์",
      type: "meal",
      lat: 14.506746911873273, 
      lng: 102.97593900896257 ,
      description: "ไปรอบนี้มีห้องแอร์คาราโอเกะชั่วโมงละสามใบแดงมีทอน ชอบนมย่างแต่ไปรอบนี้นมย่างเหนียวหน่อย อาหารจัดจ้าน บรรยากาศดี",
    },
    {
      day: 2,
      time: "13:30",
      name: "ปราสาทเมืองต่ำ",
      type: "attraction",
      lat: 14.496365,
      lng: 102.982381,
      description: "ศาสนสถานขอมโบราณใกล้ปราสาทพนมรุ้ง",
    },
    {
      day: 2,
      time: "19:00",
      name: "โรงแรมบุรีเทล — คืนที่ 2",
      type: "hotel",
      lat: 14.992840027644188,
      lng:  103.09420706691186,
      description: "ใหม่ สะอาด สวย อาหารเช้าเป็นบุฟเฟ่โรงแรมสวยสะดุดตา ที่จอดรถกว้างมากกก พนักงานบริการต้อนรับดี สรุปติดใจ",
    },

    // DAY 3 — พิมายและเดินทางกลับกรุงเทพฯ
    {
      day: 3,
      time: "09:00",
      name: "อุทยานประวัติศาสตร์พิมาย",
      type: "attraction",
      lat: 15.221047,
      lng: 102.493763,
      description: "โบราณสถานขอมสำคัญของจังหวัดนครราชสีมา",
    },
    {
      day: 3,
      time: "12:00",
      name: "อ.กุ้งเผา - โคราช - Or.Kungphao - Korat",
      type: "meal",
      lat: 15.015632069516785, 
      lng: 102.06488743639078,
      description: "บรรยากาสดีวิสวยมีก้องรองรับแบบหลากหลายตามชอบ แพ หรือห้องแอร์ มีดนตรีสดไห้ฟังสบาย อาหารรสชาติดี หรูหรา สะอาด เหมสะทั้งแบบครอบครัว โรแมนติก และสังสรรค์ ที่จอดรดสะดวกสบาย",
    },
    {
      day: "restaurant",
      time: "แนะนำ",
      name: "ซ้อเรือง อาหารตามสั่ง",
      type: "meal",
      lat: 14.9768758,
      lng: 102.0913421,
      description: "ร้านอาหารตามสั่งในตัวเมืองนครราชสีมา",
    },
    {
      day: "restaurant",
      time: "แนะนำ",
      name: "เจ๊น้อยกระโทก",
      type: "meal",
      lat: 14.9657784,
      lng: 102.0888697,
      description: "ร้านอาหารในตัวเมืองนครราชสีมา",
    },
    {
      day: "restaurant",
      time: "แนะนำ",
      name: "ลาบโต๊ะแดง บุรีรัมย์",
      type: "meal",
      lat: 15.000352,
      lng: 103.1053307,
      description: "ร้านอาหารในตัวเมืองบุรีรัมย์",
    },
    {
      day: "restaurant",
      time: "แนะนำ",
      name: "ราดหน้าสวนหมาก",
      type: "meal",
      lat: 14.9730537,
      lng: 102.0941316,
      description: "140 ถนนจอมสุรางค์ยาตร์ ตำบลในเมือง อำเภอเมืองนครราชสีมา",
    },
    {
      day: 3,
      time: "14:30",
      name: "ภาพเขียนสีเขาจันทร์งาม",
      type: "attraction",
      lat: 14.814949,
      lng: 101.594438,
      description: "เป็นภาพเขียนสีก่อนประวัติศาสตร์ อายุประมาณ 3,000 - 4,000 ปี",
    },
  
    {
      day: 3,
      time: "19:00",
      name: "มหาวิทยาลัยศิลปากร วังท่าพระ",
      type: "finish",
      lat: 13.7525,
      lng: 100.4899,
      description: "จุดสิ้นสุดการเดินทาง",
    },

    // โรงพยาบาล — ใช้เป็นจุดอ้างอิงฉุกเฉิน
    {
      day: "hospital",
      time: "ฉุกเฉิน",
      name: "โรงพยาบาลมหาราชนครราชสีมา",
      type: "hospital",
      lat: 14.984645,
      lng: 102.098934,
      description:
        "โรงพยาบาลหลักในจังหวัดนครราชสีมา",
    },
    {
      day: "hospital",
      time: "ฉุกเฉิน",
      name: "โรงพยาบาลบุรีรัมย์",
      type: "hospital",
      lat: 15.00533,
      lng: 103.10024,
      description: "โรงพยาบาลในจังหวัดบุรีรัมย์",
    },
    {
      day: "hospital",
      time: "ฉุกเฉิน",
      name: "โรงพยาบาลพิมาย",
      type: "hospital",
      lat: 15.230833,
      lng: 102.495278,
      description: "โรงพยาบาลในอำเภอพิมาย",
    },
    {
      day: "hospital",
      time: "ฉุกเฉิน",
      name: "โรงพยาบาลสูงเนิน",
      type: "hospital",
      lat: 14.8785157,
      lng: 101.8293142,
      description: "โรงพยาบาลใกล้แหล่งโบราณคดีเมืองเสมา อำเภอสูงเนิน",
    },
    {
      day: "hospital",
      time: "ฉุกเฉิน",
      name: "โรงพยาบาลกรุงเทพราชสีมา",
      type: "hospital",
      lat: 14.98107,
      lng: 102.0727105,
      description: "โรงพยาบาลเอกชนในตัวเมืองนครราชสีมา",
    },
    {
      day: "hospital",
      time: "ฉุกเฉิน",
      name: "โรงพยาบาลเซนต์เมรี่",
      type: "hospital",
      lat: 14.9868039,
      lng: 102.0930132,
      description: "โรงพยาบาลเอกชนในตัวเมืองนครราชสีมา",
    },
    {
      day: "hospital",
      time: "ฉุกเฉิน",
      name: "โรงพยาบาลค่ายสุรนารี",
      type: "hospital",
      lat: 14.9649019,
      lng: 102.0875744,
      description: "โรงพยาบาลในพื้นที่ค่ายสุรนารี โปรดตรวจสอบการเข้าใช้บริการ",
    },
    {
      day: "hospital",
      time: "ฉุกเฉิน",
      name: "โรงพยาบาลนครราชสีมา",
      type: "hospital",
      lat: 14.9255327,
      lng: 101.965158,
      description: "โรงพยาบาลบริเวณโคกกรวด จังหวัดนครราชสีมา",
    },
    {
      day: "hospital",
      time: "ฉุกเฉิน",
      name: "โรงพยาบาลนางรอง",
      type: "hospital",
      lat: 14.634393,
      lng: 102.7874979,
      description: "โรงพยาบาลใกล้เส้นทางไปอุทยานประวัติศาสตร์พนมรุ้ง",
    },
    {
      day: "hospital",
      time: "ฉุกเฉิน",
      name: "โรงพยาบาลเฉลิมพระเกียรติ",
      type: "hospital",
      lat: 14.5561806,
      lng: 102.9275876,
      description: "โรงพยาบาลใกล้อุทยานประวัติศาสตร์พนมรุ้ง",
    },
    {
      day: "hospital",
      time: "ฉุกเฉิน",
      name: "โรงพยาบาลเอกชนบุรีรัมย์",
      type: "hospital",
      lat: 15.004588,
      lng: 103.1121933,
      description: "โรงพยาบาลเอกชนในตัวเมืองบุรีรัมย์",
    },
  ];
  const restaurantSearches = [
    { name: "แมนโร่ ซั่วหมี่โคราช", query: "แมนโร่ ซั่วหมี่โคราช" },
    { name: "ไก่ย่างนายเมือง 2 มิตรภาพ", query: "ไก่ย่างนายเมือง 2 มิตรภาพ โคราช" },
    { name: "ตำกระเทย บุรีรัมย์", query: "ตำกระเทย บุรีรัมย์" },
    { name: "แม่ตุ้ยแจ่วฮ้อน", query: "แม่ตุ้ยแจ่วฮ้อน" },
    { name: "ถนนคนเดินเซราะกราว", query: "ถนนคนเดินเซราะกราว บุรีรัมย์" },
    { name: "แคลิฟอร์เนียลาบก้อย", query: "แคลิฟอร์เนียลาบก้อย" },
  ];

  const styles = {
    start: { color: "#16a34a", icon: "🚩", label: "จุดเริ่มต้น" },
    finish: { color: "#dc2626", icon: "🏁", label: "จุดสิ้นสุด" },
    attraction: {
      color: "#3478db",
      icon: "🏛️",
      label: "สถานที่ท่องเที่ยว",
    },
    alternative: {
      color: "#9333ea",
      icon: "🔀",
      label: "สถานที่ทางเลือก",
    },
    meal: { color: "#d97706", icon: "🍽️", label: "อาหาร" },
    hotel: { color: "#0891b2", icon: "🏨", label: "ที่พัก" },
    transit: { color: "#64748b", icon: "🚌", label: "จุดเดินทาง" },
    hospital: { color: "#e11d48", icon: "🏥", label: "โรงพยาบาล" },
  };

  const map = L.map("isan-map", {
    scrollWheelZoom: false,
  }).setView([15, 102], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const markers = [];
  const markerByLocation = new Map();
  const endpointMarkerByLocation = new Map();
  const markerLayer = L.layerGroup().addTo(map);
  const listElement = document.getElementById("isan-map-locations");
  const titleElement = document.getElementById("isan-map-list-title");
  const countElement = document.getElementById("isan-map-list-count");
  const dayButtons = document.querySelectorAll(".isan-day-btn");

  let selectedDay = "all";
  let selectedLocation = null;

  function escapeHTML(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  }

  function googleMapsUrl(location) {
    return (
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(`${location.lat},${location.lng}`)
    );
  }

  function googleMapsSearchUrl(query) {
    return (
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(query)
    );
  }

  function createMarker(location) {
    const style = styles[location.type] || styles.attraction;

    const icon = L.divIcon({
      className: "",
      html: `<div class="isan-pin" style="background:${style.color}">
        <span>${style.icon}</span>
      </div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 32],
      popupAnchor: [0, -30],
    });

    const marker = L.marker([location.lat, location.lng], { icon }).bindPopup(`
        <div class="isan-map-popup">
          <strong>${escapeHTML(location.time)} · ${escapeHTML(location.name)}</strong>
          <p>${escapeHTML(location.description)}</p>
          <a href="${googleMapsUrl(location)}"
             target="_blank" rel="noopener noreferrer">
            เปิดใน Google Maps ↗
          </a>
        </div>
      `);

    marker.on("click", () => {
      selectedLocation = location;
      renderList();
      scrollToSelectedLocation();
    });

    markers.push({ location, marker });
    markerByLocation.set(location, marker);
  }

  locations.forEach(createMarker);

  function isCoincidentEndpoint(location) {
    if (location.type !== "start" && location.type !== "finish") return false;

    const counterpartType = location.type === "start" ? "finish" : "start";
    return locations.some(
      (candidate) =>
        candidate.type === counterpartType &&
        candidate.lat === location.lat &&
        candidate.lng === location.lng,
    );
  }

  function bindLocationChoices(marker, cluster, heading) {
    const locationButtons = cluster.items
      .map(
        ({ location }) => `
          <button type="button" class="isan-cluster-location"
            data-cluster-location-index="${locations.indexOf(location)}">
            <span>${escapeHTML(location.time)}</span>
            <strong>${escapeHTML(location.name)}</strong>
          </button>
        `,
      )
      .join("");

    marker
      .bindPopup(
        `<div class="isan-cluster-popup">
          <strong>${heading}</strong>
          <div>${locationButtons}</div>
        </div>`,
        { maxWidth: 280, minWidth: 200 },
      )
      .on("popupopen", (event) => {
        event.popup
          .getElement()
          .querySelectorAll("[data-cluster-location-index]")
          .forEach((button) => {
            button.addEventListener("click", () => {
              const location =
                locations[Number(button.dataset.clusterLocationIndex)];
              if (location) focusLocation(location);
            });
          });
      });

    return marker;
  }

  function createEndpointPairMarker(cluster) {
    const endpointMarker = L.marker(cluster.center, {
      icon: L.divIcon({
        className: "isan-endpoint-pair-icon",
        html: `<div class="isan-endpoint-pair" role="img"
          aria-label="จุดเริ่มต้นและจุดสิ้นสุดอยู่ตำแหน่งเดียวกัน">
          <span class="isan-endpoint-start">🚩</span>
          <span class="isan-endpoint-finish">🏁</span>
        </div>`,
        iconSize: [88, 42],
        iconAnchor: [44, 21],
      }),
    });

    cluster.items.forEach(({ location }) =>
      endpointMarkerByLocation.set(location, endpointMarker),
    );

    return bindLocationChoices(
      endpointMarker,
      cluster,
      "จุดเริ่มต้นและจุดสิ้นสุด",
    );
  }

  function createClusterMarker(cluster) {
    const clusterMarker = L.marker(cluster.center, {
      icon: L.divIcon({
        className: "isan-cluster-icon",
        html: `<button type="button" class="isan-marker-cluster"
          aria-label="มี ${cluster.items.length} สถานที่ กดเพื่อขยาย">${cluster.items.length}</button>`,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      }),
      keyboard: false,
    });

    function openClusterLocations() {
      bindLocationChoices(
        clusterMarker,
        cluster,
        `เลือกสถานที่ (${cluster.items.length})`,
      ).openPopup();
    }

    function zoomToCluster() {
      if (map.getZoom() >= 17) {
        openClusterLocations();
        return;
      }

      const bounds = L.latLngBounds(
        cluster.items.map(({ location }) => [location.lat, location.lng]),
      );
      map.fitBounds(bounds, {
        padding: [48, 48],
        maxZoom: Math.min(17, map.getZoom() + 3),
      });
    }

    clusterMarker.on("click", zoomToCluster);
    clusterMarker.on("popupopen", (event) => {
      event.popup
        .getElement()
        .querySelectorAll("[data-cluster-location-index]")
        .forEach((button) => {
          button.addEventListener("click", () => {
            const location =
              locations[Number(button.dataset.clusterLocationIndex)];
            if (location) focusLocation(location);
          });
        });
    });

    return clusterMarker;
  }

  function renderMapMarkers() {
    markerLayer.clearLayers();
    const clusters = [];
    const clusterRadius = 48;

    markers
      .filter(
        ({ location }) =>
          isVisible(location) &&
          (location !== selectedLocation || isCoincidentEndpoint(location)),
      )
      .forEach((item) => {
        const point = map.latLngToLayerPoint(item.marker.getLatLng());
        const cluster = clusters.find(
          (candidate) =>
            point.distanceTo(candidate.centerPoint) <= clusterRadius,
        );

        if (cluster) {
          cluster.items.push(item);
          const points = cluster.items.map(({ marker }) =>
            map.latLngToLayerPoint(marker.getLatLng()),
          );
          cluster.centerPoint = L.point(
            points.reduce((sum, current) => sum + current.x, 0) / points.length,
            points.reduce((sum, current) => sum + current.y, 0) / points.length,
          );
          cluster.center = map.layerPointToLatLng(cluster.centerPoint);
        } else {
          clusters.push({
            items: [item],
            centerPoint: point,
            center: item.marker.getLatLng(),
          });
        }
      });

    clusters.forEach((cluster) => {
      if (cluster.items.length === 1) {
        markerLayer.addLayer(cluster.items[0].marker);
      } else if (
        cluster.items.length === 2 &&
        cluster.items.some(({ location }) => location.type === "start") &&
        cluster.items.some(({ location }) => location.type === "finish") &&
        cluster.items.every(
          ({ location }) =>
            location.lat === cluster.items[0].location.lat &&
            location.lng === cluster.items[0].location.lng,
        )
      ) {
        markerLayer.addLayer(createEndpointPairMarker(cluster));
      } else {
        markerLayer.addLayer(createClusterMarker(cluster));
      }
    });
    const expandedMarker = markerByLocation.get(selectedLocation);
    if (expandedMarker && isVisible(selectedLocation)) {
      markerLayer.addLayer(expandedMarker);
    }
  }

  function isVisible(location) {
    if (selectedDay === "all") return true;
    if (selectedDay === "hospital") return location.type === "hospital";
    if (selectedDay === "meal") return location.type === "meal";
    return String(location.day) === selectedDay;
  }

  function focusLocation(location) {
    if (isCoincidentEndpoint(location)) {
      selectedLocation = location;
      renderList();
      renderMapMarkers();
      const marker = endpointMarkerByLocation.get(location);
      if (marker) marker.openPopup();
      return;
    }

    const marker = markerByLocation.get(location);
    if (!marker) return;

    selectedLocation = location;
    renderList();
    renderMapMarkers();
    const target = L.latLng(location.lat, location.lng);
    const shouldMove =
      map.getZoom() < 13 || map.getCenter().distanceTo(target) > 50;

    if (shouldMove) {
      map.once("moveend", () => marker.openPopup());
      map.flyTo(target, 13, { duration: 0.7 });
    } else {
      marker.openPopup();
    }
  }

  function scrollToSelectedLocation() {
    const selectedButton = listElement.querySelector(
      ".isan-map-location.selected",
    );
    selectedButton?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function renderList() {
    const visibleLocations = locations.filter(isVisible);

    titleElement.textContent =
      selectedDay === "all"
        ? "สถานที่ทั้งหมด"
        : selectedDay === "hospital"
          ? "โรงพยาบาล"
          : selectedDay === "meal"
            ? "ร้านอาหาร"
            : `สถานที่ DAY ${selectedDay}`;

    countElement.textContent =
      selectedDay === "meal"
        ? `${visibleLocations.length} จุดบนแผนที่ · ${restaurantSearches.length} จุดค้นหา`
        : `${visibleLocations.length} จุด`;

    const locationItems = visibleLocations
      .map((location) => {
        const style = styles[location.type] || styles.attraction;
        const isSelected = selectedLocation === location;

        return `
        <button type="button"
          class="isan-map-location ${isSelected ? "selected" : ""}"
          data-location-index="${locations.indexOf(location)}">
          <span class="isan-map-location-marker"
            style="background:${style.color}">${style.icon}</span>
          <span class="isan-map-location-content">
            <span class="isan-map-location-top">
              <span class="isan-map-location-time">${escapeHTML(location.time)}</span>
              <span class="isan-map-location-type">${style.label}</span>
            </span>
            <span class="isan-map-location-name">${escapeHTML(location.name)}</span>
            <span class="isan-map-location-desc">${escapeHTML(location.description)}</span>
            <span class="isan-map-location-link">ดูบนแผนที่ ↗</span>
          </span>
        </button>
      `;
      })
      .join("");

    const restaurantItems =
      selectedDay === "meal"
        ? restaurantSearches
            .map(
              ({ name, query }) => `
                <a class="isan-map-location isan-map-location-search"
                  href="${googleMapsSearchUrl(query)}"
                  target="_blank" rel="noopener noreferrer">
                  <span class="isan-map-location-marker"
                    style="background:${styles.meal.color}">${styles.meal.icon}</span>
                  <span class="isan-map-location-content">
                    <span class="isan-map-location-top">
                      <span class="isan-map-location-time">ยังไม่ปักหมุด</span>
                      <span class="isan-map-location-type">อาหาร</span>
                    </span>
                    <span class="isan-map-location-name">${escapeHTML(name)}</span>
                    <span class="isan-map-location-desc">ยังไม่พบพิกัดที่ยืนยันได้</span>
                    <span class="isan-map-location-link">ค้นหาใน Google Maps ↗</span>
                  </span>
                </a>
              `,
            )
            .join("")
        : "";

    listElement.innerHTML = locationItems + restaurantItems;

    listElement.querySelectorAll("[data-location-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const location = locations[Number(button.dataset.locationIndex)];
        focusLocation(location);
      });
    });
  }

  function applyFilter(day) {
    selectedDay = day;
    selectedLocation = null;

    dayButtons.forEach((button) => {
      const active = button.dataset.day === day;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    renderList();
    renderMapMarkers();

    const visible = markers.filter(({ location }) => isVisible(location));

    if (visible.length) {
      const bounds = L.latLngBounds(
        visible.map(({ location }) => [location.lat, location.lng]),
      );
      map.fitBounds(bounds, { padding: [35, 35], maxZoom: 12 });
    }
  }

  dayButtons.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.day));
  });

  map.on("zoomend", renderMapMarkers);

  document.getElementById("isan-map-reset").addEventListener("click", () => {
    applyFilter("all");
  });

  // เริ่มต้นด้วยภาพรวมทุกวัน
  applyFilter("all");

  // Leaflet ต้องคำนวณขนาดใหม่เมื่อ Section ถูกแสดง
  setTimeout(() => map.invalidateSize(), 250);

  // เผื่อเว็บมีปุ่มเปลี่ยนธีม ให้แผนที่ปรับขนาดหลังเปลี่ยนธีม
  const section = document.getElementById("isan-map-section");
  if (section && typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(section);
  }
})();

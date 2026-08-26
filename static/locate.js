const langData = {
    zh: {
        title: "LocateOS 浏览器定位工具，让你时刻不迷路",
        btnLang: "English",
        akPlaceholder: "填入你的百度地图AK",
        waiting: "等待定位...",
        noAk: "请先填写AK",
        errGeo: "获取定位失败",
        locateText:"开始定位"
    },
    en: {
        title: "LocateOS Browser Location Tool",
        btnLang: "中文",
        akPlaceholder: "Input Baidu Map AK",
        waiting: "Locating...",
        noAk: "Please input AK",
        errGeo: "Get location failed",
        locateText:"Start Locate"
    }
};

document.addEventListener('DOMContentLoaded', function(){
    let currentLang = "zh";
    const h1El = document.querySelector("h1");
    const langSwitchBtn = document.getElementById("langSwitch");
    const akInput = document.getElementById("akInput");
    const resultBox = document.getElementById("resultBox");
    const mapContainer = document.getElementById("mapContainer");
    const locateBtn = document.getElementById("locateBtn");

    let map = null;

    function renderLang() {
        const text = langData[currentLang];
        h1El.innerText = text.title;
        langSwitchBtn.innerText = text.btnLang;
        akInput.placeholder = text.akPlaceholder;
        locateBtn.innerText = text.locateText;
    }
    renderLang();

    langSwitchBtn.addEventListener("click", function () {
        if (currentLang === "zh") {
            currentLang = "en";
        } else {
            currentLang = "zh";
        }
        renderLang();
    });

    // 修复：loadBaiduMap 使用传入的ak参数，WebGL v1.0
    function loadBaiduMap(ak) {
        return new Promise((resolve, reject) => {
            if (window.BMapGL) {
                resolve(window.BMapGL);
                return;
            }
            const cbName = "_bmap_callback_" + Date.now();
            window[cbName] = function () {
                resolve(window.BMapGL);
                delete window[cbName];
            };
            const script = document.createElement("script");
            script.src = "https://api.map.baidu.com/api?v=1.0&type=webgl&ak=" + ak + "&callback=" + cbName;
            script.onerror = function () {
                delete window[cbName];
                reject("地图JS网络加载失败，请检查网络/AK");
            };
            document.body.appendChild(script);
        });
    }

    const x_PI = Math.PI * 3000.0 / 180.0;
    const PI = Math.PI;
    const a = 6378245.0;
    const ee = 0.00669342162296594323;

    function wgs84ToGcj02(lng, lat) {
        lat = +lat;
        lng = +lng;
        if (outOfChina(lng, lat)) {
            return { lng: lng, lat: lat };
        }
        let dlat = transformLat(lng - 105.0, lat - 35.0);
        let dlng = transformLng(lng - 105.0, lat - 35.0);
        const radlat = lat / 180.0 * PI;
        let magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        const sqrtmagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
        dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
        const mglat = lat + dlat;
        const mglng = lng + dlng;
        return { lng: mglng, lat: mglat };
    }
    function gcj02ToBd09(lng, lat) {
        lat = +lat;
        lng = +lng;
        const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
        const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
        const bdLng = z * Math.cos(theta) + 0.0065;
        const bdLat = z * Math.sin(theta) + 0.006;
        return { lng: bdLng, lat: bdLat };
    }
    function gpsToBd09(lng, lat) {
        const gcj = wgs84ToGcj02(lng, lat);
        return gcj02ToBd09(gcj.lng, gcj.lat);
    }
    function outOfChina(lng, lat) {
        return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
    }
    function transformLat(x, y) {
        let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
        return ret;
    }
    function transformLng(x, y) {
        let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
        return ret;
    }

    async function startLocate() {
        console.log("startLocate被执行");
        const text = langData[currentLang];
        const ak = akInput.value.trim();
        resultBox.innerText = text.waiting;
        
        if (!navigator.geolocation) {
            resultBox.innerText = text.errGeo;
            return;
        }

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const wgsLng = pos.coords.longitude;
            const wgsLat = pos.coords.latitude;
            resultBox.innerText = `WGS84：lng:${wgsLng}, lat:${wgsLat}`;
            const bd = gpsToBd09(wgsLng, wgsLat);

            if(ak !== ""){
                try {
                    const BMapGL = await loadBaiduMap(ak);
                    if(!map){
                        map = new BMapGL.Map("mapContainer");
                    }
                    map.centerAndZoom(new BMapGL.Point(bd.lng, bd.lat),15);
                    map.enableScrollWheelZoom(true);
                    const point = new BMapGL.Point(bd.lng, bd.lat);
                    const marker = new BMapGL.Marker(point);
                    map.addOverlay(marker);

                    // 新增：点击marker弹出信息窗口
                     const infoOpts = {
                     width:280,
                     title:"定位点信息"
                   };
const infoContent = `
WGS84原始：${wgsLng}, ${wgsLat}<br>
BD09百度坐标：${bd.lng.toFixed(6)}, ${bd.lat.toFixed(6)}
`;
const infoWin = new BMapGL.InfoWindow(infoContent, infoOpts);

marker.addEventListener("click", ()=>{
    map.openInfoWindow(infoWin, point);
})

                    
                }catch(err){
                    resultBox.innerText = err;
                }
            }else{
                resultBox.innerText += "\n未填写AK，仅输出WGS‑84原始坐标，无地图";
            }

        }, (err) => {
            resultBox.innerText = text.errGeo + " " + err.message;
        });
    }

    // ✅关键修复：绑定按钮放到这里！页面加载完立刻绑定，不再嵌套在定位回调里面！
    locateBtn.addEventListener("click", startLocate);
});

// Check login
autoLogin();

/* Utilities */

function isMobileOrTablet() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

function Holder(target, onhold, onunhold, stall){
    var timer = null;
    var downEvent;

    function mouseDown(event){
        downEvent = event;
        event.preventDefault();
        
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(holdExec, stall);
    }
    
    function mouseUp(event){
        if (timer) window.clearTimeout(timer);
        
        if (downEvent){
            onunhold(event);
            timer = downEvent = null;
        }
    }

    function holdExec(){
        onhold(downEvent);
        timer = downEvent = null;
    }

    target.addEventListener("mousedown", mouseDown);
    window.addEventListener("mouseup", mouseUp);
    window.addEventListener("mouseout", mouseUp);
}

function generateOptionTagList(start, end){
    var out = "";
    out += `<option value="${start}">${start}</option>`;
    for (var i = start + 1; i <= end; ++i){
        out += `<option value="${i}">${i}</option>`;
    }
    return out;
}

function stringToElement(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString;
    return div.firstChild;
}

function strcmp(a, b) {
    return a.localeCompare(b);
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        console.error(error.message);
    }
}

function renderHTML(data){

    data = data["data"][0];

    var temp;

    if (["Spell Card", "Trap Card"].includes(data.type)){
        temp = `<div class="row">
    <div class="col mb-3">
        <img class="card_img" src="${data.card_images[0].image_url}" />
    </div>
</div>
<div class="row">
    <h2 class="fs-1">${data.name}</h2>
</div>
<div class="row">
    <h2 class="fs-5">${data.type} • ${data.race}</h2>
</div>${data.archetype ? 
`<div class="row mb-3">
    <h2 class="fs-4">${data.archetype}</h2>
</div>` : ""
}
<hr>
<h2 class="fs-5">Description</h2>
<div class="row border border-dark">                            
    <p>${data.desc}</p>
</div>`;
        return temp;
    }

    if (data.type.indexOf("Pendulum") != -1){
        temp = `[ Pendulum Effect ] ${data.pend_desc} <br/><br/> [ Monster Effect ] ${data.monster_desc}`;
    }else{
        temp = data.desc;
    }

    var level_rank_scale;
    var is_link = false;

    if (data.type.indexOf("Pendulum") != -1){
        level_rank_scale = `Level ${data.level} • Pendulum Scale ${data.scale}`;
    }else if (data.type.indexOf("Link") != -1){
        level_rank_scale = `Link ${data.linkval}`;
        is_link = true;
    }else{
        level_rank_scale = `Level ${data.level}`;
    }

    temp = `<div class="row">
    <div class="col mb-3">
        <img class="card_img" src="${data.card_images[0].image_url}" />
    </div>
</div>
<div class="row">
    <h2 class="fs-1">${data.name}</h2>
</div>
<div class="row">
    <h2 class="fs-5">${data.type} • ${data.attribute} • ${data.race}</h2>
</div>${data.archetype ? 
`<div class="row mb-3">
    <h2 class="fs-4">${data.archetype}</h2>
</div>` : ""
}<div class="row mb-2">
  <div class="col-6">
    <h2 class="fs-6">${level_rank_scale}</h2>
  </div>
  <div class="col">
    <h2 class="fs-6">ATK ${data.atk}</h2>
  </div>
  <div class="col">
    <h2 class="fs-6">DEF ${is_link ? "-" : data.def}</h2>
  </div>
</div>
<hr>
<h2 class="fs-5">Description</h2>
<div class="row border border-dark">                            
    <p>${temp}</p>
</div>`;
    return temp;
}

function prepareDMYSelector(){
    var dlist = generateOptionTagList(1, 31),
        mlist = generateOptionTagList(1, 12),
        ylist = generateOptionTagList(1999, window.currentDate.getFullYear());

    document.getElementById("DEnd").innerHTML = '<option value=""></option>' + (document.getElementById("DStart").innerHTML = dlist);
    document.getElementById("MEnd").innerHTML = '<option value=""></option>' + (document.getElementById("MStart").innerHTML = mlist);
    document.getElementById("YEnd").innerHTML = '<option value=""></option>' + (document.getElementById("YStart").innerHTML = ylist);
}

function prepareApplication(){

    var sort_type = document.getElementById("sort");
    var sort_order = document.getElementById("sort_order");

    sort_type.onchange = function(e){
        sort_order.disabled = sort_type.value == "name";
    }

    prepareDMYSelector();

    // Initialize the select everytime the modal is opened
    $('#CardFilter').on('shown.bs.modal', function () {
        $('.select', this).chosen({width: "100%"});
    });
}

function prepareGlobs(){
    if (localStorage["cardID"] == undefined)
        window.cardIDs = {};
    else{
        try {
            window.cardIDs = JSON.parse(localStorage["cardID"]);
        }catch (e){
            window.cardIDs = {};
        }
    }

    window.deck = {
        "main": {},
        "extra": {},
        "count": 0
    }

    window.currentDate = new Date();

    window.cardDesc = new bootstrap.Modal(document.getElementById('CardDesc'));
}

function prepareListeners(){

    var searchCards = function(e){
        e.preventDefault();
        search();
    }

    document.getElementById("search_btn").onclick = searchCards;
    document.getElementById("search").onsubmit = searchCards;

    document.getElementById("clear_btn").onclick = clearDeck;
    document.getElementById("toWord").onclick = toWord;
    document.getElementById("toYdk").onclick = toYdk;
    document.getElementById("fromYdk").onclick = uploadYdk;
    document.getElementById("fileUpload").onchange = fromYdk;
    document.getElementById("sort_btn").onclick = sortDeck;
    document.getElementById("searchResult").onscrollend = searchNextPage;
}

/* Main functions */

// Searcher
function animateSearch(status){
    var spans = document.getElementById("search_btn").getElementsByTagName("span");
    spans[0].setAttribute("style", status ? "" : "display: none;");
    spans[1].setAttribute("style", !status ? "" : "display: none;");
}

function search(query = null){
    var isAppendSearch = query != null;

    animateSearch(true);

    if (!isAppendSearch){
        var sort_type = $("#sort").val();
        var asc = $("#sort_order").val() == "asc";

        var sort;

        switch (sort_type){
            case 'name':
                sort = 1;
                break;
            case 'level':
                sort = asc ? 3 : 2;
                break;
            case 'atk':
                sort = asc ? 5 : 4;
                break;
            case 'def':
                sort = asc ? 7 : 6;
                break;
            case 'pscale':
                sort = asc ? 9 : 8;
                break;
            case 'link-level':
                sort = asc ? 12 : 11;
                break;
            case 'date':
                sort = asc ? 21 : 20;
                break;
            default:
                return;
        }

        query = {
            "page": 1,
            "search": $("#search_box").val(),
            "sort": sort,
            "attr": $("#attr").val(),
            "icon": $("#icon").val(),
            "montype": $("#montype").val(),
            "cardtype": [$("#cardtype").val(), $('input[name="cardtype_nor"]:checked').val()],
            "pscale": $("#pscale").val(),
            "level": $("#level").val(),
            "link-level": $("#link-level").val(),
            "link-arrow": [$("#link-arrow").val(), $('input[name="linkarrow_nor"]:checked').val()],
            "startDate": [$("#DStart").val(), $("#MStart").val(), $("#YStart").val()],
            "endDate": [$("#DEnd").val(), $("#MEnd").val(), $("#YEnd").val()],
            "atk": [$("#atkfrom").val(), $("#atkto").val()],
            "def": [$("#deffrom").val(), $("#defto").val()]
        }
    }

    window.prevSearch = {
        "query": query,
        "has_next": null
    }

    fetch("https://decksaver.glitch.me/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query)
    }).then(r => r.json().then(function(r){
        processSearchResult(r, isAppendSearch);
    }));
}

function animateNextSearch(enable){
    var searchResult = document.getElementById("searchResult");

    if (enable){
        var loading_next = stringToElement(`<div class="d-flex justify-content-center m-2">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        </div>`);

        searchResult.appendChild(loading_next);
        searchResult.scrollTop = searchResult.scrollHeight;
    }else{
        searchResult.lastChild.remove();
    }
}

function searchNextPage(event){

    if (window.prevSearch 
        && this.childElementCount 
        && Math.abs(this.scrollTop - (this.scrollHeight - this.offsetHeight)) <= this.lastChild.offsetHeight * 2  // Scrolled to the last 2 cards
        && window.prevSearch.has_next){

        animateNextSearch(true);
        
        window.prevSearch.query["page"] += 1;
        search(window.prevSearch.query);
    }
}

function processSearchResult(result, appendResult = false){

    window.prevSearch.has_next = result.pop();

    const EFFECTS = ["TRAP", "SPELL"];

    var searchResult = document.getElementById("searchResult");

    if (!appendResult)
        searchResult.innerHTML = "";
    else
        animateNextSearch(false);

    var prevSearchLength = searchResult.childElementCount;

    var cardnames = "";
    var cards = {};
    
    for (var index = 0; index < result.length; ++index){
        let card = result[index];

        var temp;
        var real_index = index + prevSearchLength;
        var imgurl = "https://upload.wikimedia.org/wikipedia/en/2/2b/Yugioh_Card_Back.jpg";

        if (window.cardIDs[card.name] == null){
            cards[card.name] = real_index;
            cardnames += encodeURIComponent(card["name"]) + "|";
        }else{
            imgurl = `https://images.ygoprodeck.com/images/cards_small/${window.cardIDs[card.name]}.jpg`;
        }

        if (EFFECTS.includes(card.attr)){
            temp = `<li class="builder-matches__match unselectable" id="card${real_index}">
                <div><a tabindex="0" class="card builder-matches__match__card">
                <img id="cimg${real_index}" alt="card_img" src="${imgurl}" class="card__img card__img--vertically-scaling">
                </a></div>
                <input style="display: none;" name="ctags" value="${card.tags.join("/")}" />
                <div class="builder-matches__match__details">
                    <p>${card.name}</p>
                    <p><small>${card.attr}</small></p>
                    <p><small>${card.tags[0]}</small></p>
                </div>
            </li>`;
        }else{
            var info = `${card.attr} - `;
            let is_link = card.tags.includes("Link");
            
            info += `${is_link ? "Link" : "Level"} ${card.level}`;

            if (card.tags.includes("Pendulum"))
                info += ` / PScale ${card.pscale}`;

            temp = `<li class="builder-matches__match unselectable" id="card${real_index}">
                <div><a tabindex="0" class="card builder-matches__match__card">
                <img id="cimg${real_index}" alt="card_img" src="${imgurl}" class="card__img card__img--vertically-scaling">
                </a></div>
                <input style="display: none;" value="${card.tags.join("/")}" />
                <div class="builder-matches__match__details">
                    <p>${card.name}</p>
                    <p><small>${info}</small></p>
                    <p><small>ATK ${card.atk}${is_link ? "" : ` / DEF ${card.def}`}</small></p>
                    <p><small>${card.tags.join(" / ")}</small></p>
                </div>
            </li>`;
        }

        searchResult.appendChild(stringToElement(temp));
    }

    var searchedCards = searchResult.childElementCount;
    
    if (!searchedCards){
        document.getElementById("searchResult").innerHTML = "No matching cards found";
    }

    animateSearch(false);

    if (Object.keys(cards).length > 0){
        fetch("https://db.ygoprodeck.com/api/v7/cardinfo.php?name=" + cardnames.slice(0, -1)).then(r => r.json().then(function (data){
            data = data["data"];
            if (data != undefined){
                data.forEach(function (card){
                    window.cardIDs[card.name] = card.id;
                    document.getElementById("cimg" + cards[card.name]).src = `https://images.ygoprodeck.com/images/cards_small/${card.id}.jpg`;
                });
            }
            enchantCards(searchedCards);
        }));
    }else if (searchedCards > 0)
        enchantCards(searchedCards);
}

function enchantCards(length){
    for (var i = 0; i < length; ++i){
        let card = document.getElementById(`card${i}`);
        card.onclick = toggleCard;
        Holder(card, () => {viewCardInfo(card.getElementsByTagName('img')[0].src.match(/(\d+)\.jpg/)[1])}, () => {}, 1000);
    }
}

function toggleCard(event){
    var name = this.getElementsByTagName('p')[0].innerText,
        id = this.getElementsByTagName('img')[0].src.match(/(\d+)\.jpg/)[1],
        tags = this.getElementsByTagName('input')[0].value.split("/");

    addCard(name, id, tags);
}

// Card manager
function addCardHTML(name, id, count, deckName, deckNode){
    var cardid = `${id}_${count}`;

    var counter = document.getElementById(deckName + "_count");
    counter.innerText = Number(counter.innerText) + 1;

    var elem = stringToElement(`<a data-loc="${deckName}" id="${cardid}" tabindex="0" class="card unselectable"><img alt="${name}"
    src="https://images.ygoprodeck.com/images/cards_small/${id}.jpg"
    class="card__img"></a>`);

    Holder(elem, () => {viewCardInfo(id)}, () => {}, 1000);

    deckNode.appendChild(elem);

    document.getElementById(cardid).onclick = removeCard;
}

function addCard(name, id, tags){
    window.deck.count++;

    if (window.deck.count == 1)
        hasCard();

    var deck, deckNode, deck;

    if (tags.includes("Fusion") || tags.includes("Synchro") || tags.includes("Xyz") || tags.includes("Link"))
        deck = window.deck.extra, deckName = "extra", deckNode = document.getElementById("extra_deck");
    else
        deck = window.deck.main, deckName = "main", deckNode = document.getElementById("main_deck");

    if (deck[id] == undefined)
        deck[id] = 1;
    else
        deck[id]++;

    addCardHTML(name, id, deck[id], deckName, deckNode);
}

function removeCard(event){
    event.preventDefault();

    let loc = this.getAttribute("data-loc");
    let cid = this.getAttribute("id").split("_")[0];

    if (loc == "main")
        window.deck.main[cid]--;
    else
        window.deck.extra[cid]--;
    window.deck.count--;

    var counter = document.getElementById(loc + "_count");
    counter.innerText = Number(counter.innerText) - 1;

    this.remove();

    if (window.deck.count == 0)
        noCards();
}


// functionality
function noCards(){
    var edits = document.getElementById("Edits");

    document.getElementById("Exports").classList.add("disabled");

    const dd = bootstrap.Dropdown.getInstance(edits);

    if (dd) dd.hide(), dd.dispose();

    edits.classList.add("disabled");
}

function hasCard(){
    document.getElementById("Exports").classList.remove("disabled");
    document.getElementById("Edits").classList.remove("disabled");
}

function clearDeck(){
    document.getElementById("extra_deck").innerHTML = document.getElementById("main_deck").innerHTML = "";
    document.getElementById("main_count").innerText = document.getElementById("extra_count").innerText = "0";
    window.deck.main = {};
    window.deck.extra = {};
    window.deck.count = 0;
    noCards();
}

function toYdk(){
    var raw = "#main\n";

    Object.keys(window.deck.main).forEach(id => {
        raw += (id + "\n").repeat(window.deck.main[id]);
    });

    raw += "\n#extra\n"
    Object.keys(window.deck.extra).forEach(id => {
        raw += (id + "\n").repeat(window.deck.extra[id]);
    });

    download(new Blob([raw], {type: 'text/plain'}), "deck.ydk");
}

function uploadYdk(){
    var fUp = document.getElementById("fileUpload");
    fUp.click();
}

function fromYdk(){
    var fUp = this;
    if (fUp.files.length == 0)
        return;

    var file = fUp.files[0];
    if (file) {
        if (file.size > 6 * 1024 * 1024){
            alert("File is to large!");
            fUp.value = null;
            return;
        }

        clearDeck();

        var main_deck = window.deck.main, 
            extra_deck = window.deck.extra,
            main_node = document.getElementById("main_deck"),
            extra_node = document.getElementById("extra_deck");

        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");

        reader.onload = function (evt) {
            var raw = evt.target.result;
            raw = raw.split("#main").slice(-1)[0];
            raw = raw.split("#extra");

            main = raw[0].matchAll(/\n[\s\t]*(\d+)/g);
            main.forEach(match => {
                window.deck.count++;

                let id = match[1];
                if (main_deck[id] == undefined)
                    main_deck[id] = 1;
                else
                    main_deck[id]++;

                addCardHTML("card", id, main_deck[id], "main", main_node);
            });

            extra = (raw.length > 1 ? raw[1] : "").split("!side")[0].matchAll(/\n[\s\t]*(\d+)/g);
            extra.forEach(match => {
                window.deck.count++;
                
                let id = match[1];
                if (extra_deck[id] == undefined)
                    extra_deck[id] = 1;
                else
                    extra_deck[id]++;

                addCardHTML("card", id, extra_deck[id], "extra", extra_node);
            });

            if (window.deck.count > 0)
                hasCard();
        }
        reader.onerror = function (evt) {
            alert("Failed to read file!");
        }
    }

    fUp.value = null;
}

function sortDeck(){
    sortCards(document.getElementById("main_deck"));
    sortCards(document.getElementById("extra_deck"));
}

function sortCards(deckNode){
    var cards = Array.from(deckNode.getElementsByTagName("a"));

    cards.sort(function (a, b){
        return a.id.localeCompare(b.id);
    });

    for (var i = 0; i < cards.length; ++i) {
        cards[i].parentNode.appendChild(cards[i]);
    }
}

function viewCardInfo(id){
    fetch("https://db.ygoprodeck.com/api/v7/cardinfo.php?id=" + id).then(r => r.json().then(function (data){
        var html = renderHTML(data);
        document.getElementById("main_desc").innerHTML = html;
        window.cardDesc.show();
    }));
}

function toWord(){
    var raw = "";

    Object.keys(window.deck.main).forEach(id => {
        raw += (id + "\n").repeat(window.deck.main[id]);
    });
    Object.keys(window.deck.extra).forEach(id => {
        raw += (id + "\n").repeat(window.deck.extra[id]);
    });

    var blob = new Blob([raw], {
        type: 'text/plain'
    });

    window.loadingDialog = new bootstrap.Modal(document.getElementById('LoadingDialog'), {
        keyboard: false,
        backdrop: 'static'
    });
    window.loadingDialog.show();

    var fd = new FormData();

    fd.append("deck0", blob, `builder_${new Date().getTime()}.ydk`);

    fetch("/api/convert?cfg=%7B%22width%22%3A5.9%2C%22height%22%3A8.6%2C%22margins%22%3A%7B%22left%22%3A1%2C%22right%22%3A0%2C%22top%22%3A0.6%2C%22bottom%22%3A0%7D%7D", {
        method: "POST",
        body: fd,
    }).then(r => r.text().then(process_downloads));
}

function process_downloads(response){
    var data = JSON.parse(response),
        key = Object.keys(data)[0];

    if (data[key]["error"] == true){
        let loadtit = document.getElementById("LoadingTitle"),
            loadmsg = document.getElementById("loadingMsg");

        loadtit.innerText = "Error";
        loadmsg.innerHTML = `<h2 class="fs-5">Conversion Failed</h2>
        <p>An unexpected error has occurred while converting the file</p>`;
        return;
    }

    var name = key.split(".").slice(0, -1)[0] + ".docx",
        link = "https://decksaver.glitch.me/download/" + data[key]["result"];

    if (isMobileOrTablet()){
        showDownloadLink(true, link);
    }else{
        preloadFile(link, name);
    }
}

function showDownloadLink(ismobile, link){
    var temp;

    if (ismobile){
        temp = `<h2 class="fs-5">Your file is ready</h2>
        <div class="input-group">
            <input type="text" readonly class="form-control" value="${link}" aria-label="Download URL" aria-describedby="dlinkcopy">
            <button class="btn btn-outline-secondary" type="button" id="dlinkcopy" onclick="copyToClipboard('${link}')">
                <i class="fa-solid fa-copy"></i> 
                Copy
            </button>
        </div>`;
    }else{
        temp = `<h2 class="fs-5">Click below if your file wasn't downloaded</h2>
        <button type="button" class="btn btn-primary" onclick="window.open('${link}', '_blank').focus()">Download</button>`;
    }

    var loadlog = document.getElementById("LoadingDialog"),
        loadtit = document.getElementById("LoadingTitle"),
        loadmsg = document.getElementById("loadingMsg");


    loadlog.addEventListener("hidden.bs.modal", function(e) {
        loadtit.innerText = "Please Wait...";
        loadmsg.innerHTML = `<h2 class="fs-5">Converting in process...</h2>
        <p>Do not exit the screen, we will notice you when finished<div class="spinner-grow" role="status"></div></p>`;
    });

    loadtit.innerText = "Finished";
    loadmsg.innerHTML = temp;

    if (ismobile){
        var elem = document.getElementById("dlinkcopy");
        var tooltip = new bootstrap.Tooltip(elem, {
            "title": "Copied!",
            "trigger": "click"
        });
        elem.addEventListener('shown.bs.tooltip', function() {
            if (window.tt_timing) window.clearTimeout(window.tt_timing);
            window.tt_timing = window.setTimeout(() => {
                tooltip.hide();
            }, 3000);
        });
    }
}

function preloadFile(link, name){
    var loadtit = document.getElementById("LoadingTitle"),
        loadmsg = document.getElementById("loadingMsg");

    loadmsg.innerHTML = `<h2 class="fs-5">Downloading...</h2>
    <p>The file will be downloaded in a few seconds...<div class="spinner-grow" role="status"></div></p>`;

    try {
        fetch(link).then(r => r.blob().then(blob => {
            download(blob, name);
            showDownloadLink(false, link);
        }));
    }catch(e){
        loadtit.innerText = "Error";
        loadmsg.innerHTML = `<h2 class="fs-5">Download Failed</h2>
        <p>An unexpected error has occurred while downloading the file</p>
        <button type="button" class="btn btn-primary" onclick="window.open('${link}', '_blank').focus()">Retry</button>`;
    }
}

function download(blob, name) {
    var blobUrl = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = blobUrl;  
    link.style = "display: none";
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
}


window.onload = function(){

    prepareGlobs();

    prepareApplication();

    prepareListeners();
}

window.onbeforeunload = function() {
    localStorage["cardID"] = JSON.stringify(window.cardIDs);
    return undefined;
}

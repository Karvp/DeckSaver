function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ')
            c = c.substring(1);
        if (c.indexOf(name) == 0)
            return decodeURIComponent(c.substring(name.length, c.length));
    }
    return "";
}

function token_auth(token, username, fail, success, error){
    fetch("/api/login", {
        method: "POST",
        credentials: "same-origin",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow",
        body: "token=" + encodeURIComponent(token) + "&u=" + encodeURIComponent(username),
    }).then(r => r.json().then(j => {
        if (j["error"] == true)
            error();
        else if (j["success"] == false)
            fail()
        else
            success();
    }));
}

function redirToLogin(){
    window.location = "https://decksaver.glitch.me/login?next=" + encodeURIComponent(window.location.href);
}

function autoLogin(){
    try {
        let token = getCookie("token"), username = getCookie("username");
        token_auth(token, username, redirToLogin, () => {}, redirToLogin);
    }catch (e){
        redirToLogin();
    }
}
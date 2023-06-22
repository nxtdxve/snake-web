var rev = "fwd";

function titlebar(val) {
    var msg = "Snake Game";
    var speed = 100;
    var pos = val;
    msg = "   |-"+msg+"-|";
    var le = msg.length;
    
    if (rev == "fwd") {
        if (pos < le) {
            pos = pos + 1;
            scroll = msg.substr(0, pos);
            document.title = scroll;
            timer = window.setTimeout("titlebar(" + pos + ")", speed);
        } else {
            rev = "bwd";
            document.title = msg; // full msg at the end of forward cycle
            timer = window.setTimeout("titlebar(" + pos + ")", speed);
        }
    } else { // rev == "bwd"
        if (pos > 0) {
            pos = pos - 1;
            scroll = msg.substr(0, pos);
            document.title = scroll;
            timer = window.setTimeout("titlebar(" + pos + ")", speed);
        } else {
            rev = "fwd";
            document.title = msg; // full msg at the end of backward cycle
            timer = window.setTimeout("titlebar(" + pos + ")", speed);
        }
    }
}

titlebar(0);

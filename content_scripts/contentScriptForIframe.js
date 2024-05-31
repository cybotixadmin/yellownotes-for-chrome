// contentScriptForIframe.js
console.log("running contentScriptForIframe.js");

try{
// Inside the iframe
window.addEventListener('scroll', function() {
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    console.log("scrollTop: " + scrollTop + ", scrollLeft: " + scrollLeft);
    window.parent.postMessage({scrollTop: scrollTop, scrollLeft: scrollLeft}, '*');
});
}catch(e){
    console.log("error in contentScriptForIframe.js: " + e);
}

var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
console.log("scrollTop: " + scrollTop + ", scrollLeft: " + scrollLeft);


const frames = window.frames;

for (let i = 0; i < frames.length; i++) {
  frames[i].document.body.style.top = "30px";
}

try{
document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('scroll', () => {
        console.log('Scroll position:', window.scrollX," " , window.scrollY);
    });
    document.addEventListener('mousemove', (event) => {
        // console.log("mousemove detected");
        // console.log(event);
        //  console.log(event.target);
    
        // Extract the x and y coordinates of the mouse cursor
        mouseX = event.clientX + window.scrollX;
        mouseY = event.clientY + window.scrollY
    
            console.log(mouseX, mouseY ); // For demonstration purposes
    
    });

});
}catch(e){
    console.log("error in contentScriptForIframe.js: " + e);
}

document.addEventListener('mousemove', (event) => {
    // console.log("mousemove detected");
    // console.log(event);
    //  console.log(event.target);

    // Extract the x and y coordinates of the mouse cursor
    mouseX = event.clientX + window.scrollX;
    mouseY = event.clientY + window.scrollY

        console.log(mouseX, mouseY ); // For demonstration purposes
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
console.log("scrollTop: " + scrollTop + ", scrollLeft: " + scrollLeft);


});

window.addEventListener('scroll', () => {
    console.log('Scroll position:', window.scrollX," " , window.scrollY);
});
try{
document.addEventListener('scroll', (event) => {
    console.log(event);
    console.log('Scroll position:', " " , window.scrollY);
});

window.onscroll = function() {myFunction()};
function myFunction() {
    console.log("scrolling");

    if (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
        console.log("scrolling");
//      document.getElementById("myImg").className = "slideUp";
    }
  }

}catch(e){
    console.log("error in contentScriptForIframe.js: " + e);
}


try{
  window.addEventListener("message", function(event) {
    console.log("Message received from parent page: " + event.data);
    // Handle message received from the parent page (event.data contains the message)
});
}catch(e){
    console.log("error in contentScriptForIframe.js: " + e);
}

function targetFunction() {
    alert("Function called from parent page!");
  }

  console.log("running contentScriptForIframe.js");

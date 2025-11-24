// siy.js
$(function () {
    
});
// End of siy.js

// hash 값으로 처리
function getHashOfName(){
    const fragment = window.location.hash.substring(1);
    let selPrdText = '';

    switch(fragment){
        case '1':
            selPrdText = 'NexDrive';
            break;
        case '2':
            selPrdText = 'Qstack';
            break;
        case '3':
            selPrdText = 'ApexBio';
            break;
        case '4':
            selPrdText = 'Dataverse';
            break;
    }

    $('#selPrdName').text(selPrdText);
}

// openPanel
function openPanel(id){
    const panel = document.getElementById(id);
    const overlay = document.querySelector(".esg_dim");

    panel.style.display = "block";
    overlay.style.display = "block";

    panel.style.animationName = "panelIn";
    overlay.style.animationName = "overlayIn";
};

// closePanel
function closePanel(id){
    const panel = document.getElementById(id);
    const overlay = document.querySelector(".esg_dim");

    panel.style.animationName = "panelOut";
    overlay.style.animationName = "overlayOut";

    panel.addEventListener(
        "animationend",
        () => {
        if (panel.style.animationName === "panelOut") {
            panel.style.display = "none";
        }
        },
        { once: true }
    );

    overlay.addEventListener(
        "animationend",
        () => {
        if (overlay.style.animationName === "overlayOut") {
            overlay.style.display = "none";
        }
        },
        { once: true }
    );
};
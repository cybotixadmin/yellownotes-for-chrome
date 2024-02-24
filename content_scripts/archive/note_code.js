/*

javascript copde for activating buttons on yellow notes

*/



try {
    // Remove enlarged font from all items
    var myList = document.querySelectorAll('tr[name="button_ribbon"] td[class="button_cell"]');

   // let elements = document.querySelectorAll('tr[name="button_ribbon"] td[class="button_cell"]');

    for (var i = 0; i < myList.length; i++) {
        console.log(myList[i]);
        myList[i].classList.remove('enlarged-font');
//            myList[i].classList.remove('clicked');
    }
} catch (e) {
    console.log(e);

}
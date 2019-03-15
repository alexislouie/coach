const bearer = localStorage.getItem('authToken');
const id = localStorage.getItem('userId');

$('main').on('click', '.about-link', function(event){
    event.preventDefault();
    $('html, body').animate({
        scrollTop: $("#about").offset().top
      }, 200);
})
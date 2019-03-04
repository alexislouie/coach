// const bearer = localStorage.authToken;

if (bearer) {
    $('header ul').html('<a href="/logout.html">Log Out</a>');
    $('header a').click(function(event) {
        window.location.replace('/index.html');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
    })
}
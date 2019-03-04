function handleSignUp() {
    $('body').on('click', '.js-signup-button', function (event) {
        event.preventDefault();

        const regUser = {};
        regUser['firstName'] = $('#reg-firstName').val();
        regUser['lastName'] = $('#reg-lastName').val();
        regUser['userName'] = $('#reg-userName').val();
        regUser['password'] = $('#reg-password').val();
        console.log(regUser);

        createUser(regUser);
    });

}

function createUser(info) {
    fetch('http://localhost:8080/users/register',
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(info)
        })
        .then(res => {
            if (res.ok) {
                return res.json()
            }
            else {
                throw Error(`Request rejected with status ${res.status}`);
            }
        })
        .then(res => {
            return window.location.replace('/login.html');
        })
}

handleSignUp();
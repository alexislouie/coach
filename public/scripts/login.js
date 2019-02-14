function handleLogin() {
    $('body').on('click', '.js-login-button', function (event) {
        event.preventDefault();

        const user = {};
        user['username'] = $('#login-username').val();
        user['password'] = $('#login-password').val();
        console.log(user);

        loginUser(user);
    })
}

function loginUser(user) {
    fetch('/auth/login',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        .then(res => {
            if (res.ok) {
                return res.json();
            }
            else {
                throw Error(`Request rejected with status ${res.status}`);
            }
        })
        .then(res => {
            // const bearer = res.authToken;
            localStorage.setItem('authToken', res.authToken);
            localStorage.setItem('userId', res.userId);
            alert('authToken = ' + localStorage.getItem('authToken'))
        })

}

handleLogin();
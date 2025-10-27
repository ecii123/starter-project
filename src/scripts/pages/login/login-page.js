import { loginUser } from '../../data/api';

export default class LoginPage {
  async render() {
    return `
      <section class="container">
        <h1>Login</h1>
        <form id="loginForm">
          <div>
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div>
            <label for="password">Password</label>
            <input type="password" id="password" required minlength="8">
            <p class="error-message" id="passwordError"></p>
          </div>
          <button type="submit">Login</button>
        </form>
        <p>Don't have an account? <a href="#/register">Register</a></p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('passwordError');

    passwordInput.addEventListener('input', () => {
      if (passwordInput.value.length < 8) {
        passwordError.textContent = 'Password must be at least 8 characters long.';
      } else {
        passwordError.textContent = '';
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
      }

      const response = await loginUser({ email, password });
      
      if (response.loginResult && response.loginResult.token) {
        localStorage.setItem('token', response.loginResult.token);
        alert('Login successful!'); 
        window.location.hash = '/'; // Ini akan memicu render ulang oleh app.js
      } else {
        alert(response.message || response.error || 'Login failed, please check your email and password.');
      }
    });
  }
}
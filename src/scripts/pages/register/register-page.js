import { registerUser } from '../../data/api';

function updateNavigation() {
  const isLoggedIn = !!localStorage.getItem('token');
  document.getElementById('home-link').classList.toggle('hidden', !isLoggedIn);
  document.getElementById('add-story-link').classList.toggle('hidden', !isLoggedIn);
  document.getElementById('login-link').classList.toggle('hidden', isLoggedIn);
  document.getElementById('register-link').classList.toggle('hidden', isLoggedIn);
  document.getElementById('logout-link').classList.toggle('hidden', !isLoggedIn);

  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      window.location.hash = '/login';
      updateNavigation();
    });
  }
}

export default class RegisterPage {
  async render() {
    return `
      <section class="container">
        <h1>Register</h1>
        <form id="registerForm">
          <div>
            <label for="name">Name</label>
            <input type="text" id="name" required>
          </div>
          <div>
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div>
            <label for="password">Password</label>
            <input type="password" id="password" required minlength="8">
            <p style="font-size: 0.8rem; color: #666;">Password must be at least 8 characters long.</p>
            <p class="error-message" id="passwordError"></p>
          </div>
          <button type="submit">Register</button>
        </form>
        <p>Already have an account? <a href="#/login">Login</a></p>
      </section>
    `;
  }

  async afterRender() {
    updateNavigation();
    const form = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('passwordError');

    passwordInput.addEventListener('input', () => {
      if (passwordInput.value.length < 8) {
        passwordError.textContent = 'Password is too short. Minimum 8 characters required.';
      } else {
        passwordError.textContent = '';
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
      }

      const response = await registerUser({ name, email, password });
      if (response.message === 'User created') {
        alert('Registration successful! Please login with your new account.');
        window.location.hash = '/login';
      } else {
        alert(response.error || 'Registration failed. Please check your details and try again.');
      }
    });
  }
}
// Inject CSS only once
if (!document.getElementById('custom-modal-style')) {
  const style = document.createElement('style');
  style.id = 'custom-modal-style';
  style.textContent = `
    .custom-modal {
      position: fixed;
      z-index: 9999;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .custom-modal.hidden { display: none; }
    .custom-modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.4);
    }
    .custom-modal-content {
      position: relative;
      background: #fff;
      border-radius: 8px;
      padding: 2rem 1.5rem 1.5rem 1.5rem;
      min-width: 320px;
      max-width: 90vw;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      z-index: 1;
      animation: fadeIn 0.2s;
    }
    .custom-modal-close {
      position: absolute;
      top: 0.5rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
    }
    .custom-modal-body { margin-bottom: 1.5rem; }
    .custom-modal-actions { text-align: right; }
    .btn { padding: 0.5em 1.2em; border-radius: 4px; border: none; cursor: pointer; }
    .btn-primary { background: #007bff; color: #fff; }
    .btn-secondary { background: #eee; color: #333; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px);}
      to { opacity: 1; transform: translateY(0);}
    }
  `;
  document.head.appendChild(style);
}

// Modal creation utility
function ensureModal() {
  if (!document.getElementById('custom-modal')) {
    const modal = document.createElement('div');
    modal.id = 'custom-modal';
    modal.className = 'custom-modal hidden';
    modal.innerHTML = `
      <div class="custom-modal-backdrop"></div>
      <div class="custom-modal-content">
        <button class="custom-modal-close" aria-label="Close">&times;</button>
        <div class="custom-modal-body"></div>
        <div class="custom-modal-actions"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

// Show modal function
function showModal({ title = '', html = '', showClose = true, showConfirm = true, confirmText = 'OK', onConfirm = null, showCancel = false, cancelText = 'Cancel', onCancel = null }) {
  ensureModal();
  const modal = document.getElementById('custom-modal');
  const body = modal.querySelector('.custom-modal-body');
  const actions = modal.querySelector('.custom-modal-actions');
  const closeBtn = modal.querySelector('.custom-modal-close');

  // Set content
  body.innerHTML = (title ? `<h2>${title}</h2>` : '') + html;
  actions.innerHTML = '';

  // Confirm button
  if (showConfirm) {
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = confirmText;
    confirmBtn.className = 'btn btn-primary';
    confirmBtn.onclick = () => {
      hideModal();
      if (onConfirm) onConfirm();
    };
    actions.appendChild(confirmBtn);
  }

  // Cancel button
  if (showCancel) {
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = cancelText;
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.onclick = () => {
      hideModal();
      if (onCancel) onCancel();
    };
    actions.appendChild(cancelBtn);
  }

  // Close button
  closeBtn.style.display = showClose ? '' : 'none';
  closeBtn.onclick = hideModal;

  // Backdrop click closes modal
  modal.querySelector('.custom-modal-backdrop').onclick = hideModal;

  // Show modal
  modal.classList.remove('hidden');
}

// Hide modal function
function hideModal() {
  const modal = document.getElementById('custom-modal');
  if (modal) modal.classList.add('hidden');
}
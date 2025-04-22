// index.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const addBtn = document.querySelector('.add-button');
    const submitBtn = document.querySelector('.submit-button');
    const overlay = document.querySelector('.overlay');
    const modal = document.querySelector('.modal');
    const closeModalBtn = document.querySelector('.close-modal');


    function getCorrectForm(n) {
        n = Math.abs(n) % 100;
        const n1 = n % 10;
        if (n > 10 && n < 20) return 'напитков';
        if (n1 > 1 && n1 < 5) return 'напитка';
        if (n1 === 1) return 'напиток';
        return 'напитков';
    }

    function updateBeverages() {
        const bevList = form.querySelectorAll('.beverage');
        bevList.forEach((bev, i) => {
            const num = i + 1;
            const heading = bev.querySelector('.beverage-count');
            if (heading) heading.textContent = `Напиток №${num}`;

            bev.querySelectorAll('input[type="radio"]')
                .forEach(r => r.name = `milk-${num}`);
            bev.querySelectorAll('input[type="checkbox"]')
                .forEach(c => c.name = `options-${num}`);

            let remBtn = bev.querySelector('.remove-button');
            if (!remBtn) {
                remBtn = document.createElement('button');
                remBtn.type = 'button';
                remBtn.className = 'remove-button';
                remBtn.innerHTML = '&times;';
                bev.insertBefore(remBtn, bev.firstChild);
            }
            remBtn.disabled = (bevList.length === 1);
        });
    }

    addBtn.addEventListener('click', e => {
        e.preventDefault();
        const first = form.querySelector('.beverage');
        if (!first) return;

        const clone = first.cloneNode(true);
        const sel = clone.querySelector('select');
        if (sel) sel.selectedIndex = 0;

        clone.querySelectorAll('input[type="radio"]')
            .forEach((r, idx) => r.checked = (idx === 0));

        clone.querySelectorAll('input[type="checkbox"]')
            .forEach(c => c.checked = false);

        const ta = clone.querySelector('textarea');
        if (ta)
            ta.value = '';

        const no = clone.querySelector('.notes-output');
        if (no)
            no.innerHTML = '';

        form.insertBefore(clone, addBtn.parentElement);
        updateBeverages();
    });

    form.addEventListener('click', e => {
        if (!e.target.classList.contains('remove-button'))
            return;
        const bevList = form.querySelectorAll('.beverage');
        if (bevList.length <= 1)
            return;

        const bev = e.target.closest('.beverage');
        if (bev)
            bev.remove();
        updateBeverages();
    });

    form.addEventListener('input', e => {
        if (!e.target.matches('textarea')) return;
        const out = e.target.closest('.field')?.querySelector('.notes-output');
        if (!out) return;
        const highlighted = e.target.value.replace(
            /(срочно|быстрее|побыстрее|скорее|поскорее|очень нужно)/gi,
            '<b>$1</b>'
        );
        out.innerHTML = highlighted;
    });

    submitBtn.addEventListener('click', e => {
        e.preventDefault();
        buildModal();
        overlay.classList.remove('hidden');
        modal.classList.remove('hidden');
    });

    function closeModal() {
        overlay.classList.add('hidden');
        modal.classList.add('hidden');
    }

    closeModalBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    function buildModal() {
        const container = modal.querySelector('.modal-content');
        if (!container) return;
        container.innerHTML = '';

        const bevList = form.querySelectorAll('.beverage');
        const count = bevList.length;
        const word = getCorrectForm(count);

        const title = document.createElement('h3');
        title.textContent = 'Заказ принят!';
        const summary = document.createElement('p');
        summary.textContent = `Вы заказали ${count} ${word}`;
        container.append(title, summary);

        const table = document.createElement('table');
        table.className = 'modal-table';
        table.innerHTML = `
      <thead>
        <tr>
          <th>Напиток</th>
          <th>Молоко</th>
          <th>Дополнительно</th>
          <th>Пожелания</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
        const tbody = table.querySelector('tbody');

        bevList.forEach((bev, i) => {
            const tr = document.createElement('tr');
            const drinkEle = bev.querySelector('select');
            const drink = drinkEle ? drinkEle.value : '';
            const milkEl = bev.querySelector(`input[name="milk-${i + 1}"]:checked`);
            const milk = milkEl ? milkEl.value : '';
            const opts = Array.from(
                bev.querySelectorAll(`input[name="options-${i + 1}"]:checked`)
            ).map(c => c.value).join(', ');
            const notes = bev.querySelector('textarea')?.value || '';

            tr.innerHTML = `
        <td>${drink}</td>
        <td>${milk}</td>
        <td>${opts}</td>
        <td>${notes}</td>
      `;
            tbody.append(tr);
        });

        container.append(table);

        const timeDiv = document.createElement('div');
        timeDiv.innerHTML = `
      <label>
        Выберите время заказа:
        <input type="time" class="order-time" />
      </label>
    `;
        const orderBtn = document.createElement('button');
        orderBtn.type = 'button';
        orderBtn.textContent = 'Оформить';
        container.append(timeDiv, orderBtn);

        orderBtn.addEventListener('click', () => {
            const inputTime = container.querySelector('.order-time');
            const val = inputTime?.value;
            if (!val) return;
            const [h, m] = val.split(':').map(Number);
            const now = new Date();
            if (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes())) {
                if (inputTime) inputTime.style.border = '1px solid red';
                alert('Мы не умеем перемещаться во времени. Выберите время позже, чем текущее');
            } else {
                closeModal();
            }
        });
    }

    updateBeverages();
});

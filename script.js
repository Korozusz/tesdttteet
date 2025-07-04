const PASSWORD = "Koroz604889";
let isAdmin = false;
let menuData = [];

// โหลดข้อมูลจาก localStorage
window.onload = function() {
  const pass = prompt("กรุณาใส่รหัสผ่านเพื่อเพิ่มเมนู (กด Cancel เพื่อดูเมนูอย่างเดียว)");

  if (pass === PASSWORD) {
    isAdmin = true;
    document.getElementById('adminSection').style.display = 'block';
  }

  loadMenu();
  renderMenu();

  // ค้นหาแบบเรียลไทม์
  document.getElementById('searchInput').addEventListener('input', function() {
    renderMenu(this.value);
  });
};

// ฟังก์ชันเพิ่มเมนู
function addMenuItem() {
  const fileInput = document.getElementById('imageInput');
  const nameInput = document.getElementById('nameInput');
  const descInput = document.getElementById('descInput');
  const linkInput = document.getElementById('linkInput');
  const categoryInput = document.getElementById('categoryInput');

  if (!fileInput.files[0]) {
    alert("กรุณาเลือกรูปภาพ");
    return;
  }
  if (nameInput.value.trim() === "") {
    alert("กรุณาใส่ชื่อเมนู");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const newItem = {
      id: Date.now(),
      category: categoryInput.value,
      imageSrc: e.target.result,
      name: nameInput.value.trim(),
      description: descInput.value.trim(),
      link: linkInput.value.trim()
    };

    menuData.push(newItem);
    saveMenu();
    renderMenu();

    // ล้างฟอร์ม
    fileInput.value = "";
    nameInput.value = "";
    descInput.value = "";
    linkInput.value = "";
  };
  reader.readAsDataURL(fileInput.files[0]);
}

// บันทึกเมนูลง localStorage
function saveMenu() {
  localStorage.setItem('korozMenuData', JSON.stringify(menuData));
}

// โหลดเมนูจาก localStorage
function loadMenu() {
  const data = localStorage.getItem('korozMenuData');
  if (data) {
    menuData = JSON.parse(data);
  }
}

// แสดงเมนู โดยรับค่า filter ค้นหา (searchText)
function renderMenu(searchText = "") {
  const container = document.getElementById('menuList');
  container.innerHTML = "";

  const filterText = searchText.toLowerCase();

  menuData
    .filter(item => {
      return (
        item.name.toLowerCase().includes(filterText) ||
        item.description.toLowerCase().includes(filterText) ||
        item.category.toLowerCase().includes(filterText)
      );
    })
    .forEach(item => {
      const div = document.createElement('div');
      div.className = "menu-item";

      // รูปภาพ
      const img = document.createElement('img');
      img.src = item.imageSrc;
      div.appendChild(img);

      // ปุ่มแก้ไขและลบ (เฉพาะ admin)
      if (isAdmin) {
        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';

        // ปุ่มแก้ไข
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️';
        editBtn.title = "แก้ไขเมนู";
        editBtn.onclick = () => openEditForm(item.id);
        btnGroup.appendChild(editBtn);

        // ปุ่มลบ
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = "ลบเมนู";
        deleteBtn.onclick = () => deleteMenuItem(item.id);
        btnGroup.appendChild(deleteBtn);

        div.appendChild(btnGroup);
      }

      // ชื่อเมนู
      const title = document.createElement('h3');
      title.textContent = item.name;
      div.appendChild(title);

      // หมวดหมู่
      const category = document.createElement('p');
      category.textContent = `หมวดหมู่: ${item.category}`;
      category.style.fontStyle = "italic";
      category.style.color = "#888";
      div.appendChild(category);

      // คำอธิบาย
      const desc = document.createElement('p');
      desc.textContent = item.description;
      div.appendChild(desc);

      // ลิงก์
      if (item.link) {
        const a = document.createElement('a');
        a.href = item.link;
        a.textContent = "ดูเพิ่มเติม";
        a.target = "_blank";
        div.appendChild(a);
      }

      container.appendChild(div);
    });
}

// เปิดฟอร์มแก้ไข
function openEditForm(id) {
  const item = menuData.find(i => i.id === id);
  if (!item) return;

  // สร้างฟอร์มแก้ไข
  const container = document.createElement('div');
  container.className = 'edit-form';

  container.innerHTML = `
    <select id="editCategory">
      <option value="ของคาว">ของคาว</option>
      <option value="ของหวาน">ของหวาน</option>
      <option value="เครื่องดื่ม">เครื่องดื่ม</option>
    </select>
    <input type="text" id="editName" value="${item.name}" />
    <textarea id="editDesc">${item.description}</textarea>
    <input type="text" id="editLink" value="${item.link}" />
    <button id="saveEditBtn">บันทึกการแก้ไข</button>
    <button id="cancelEditBtn">ยกเลิก</button>
  `;

  // แทนที่เมนูเก่าด้วยฟอร์มนี้
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(div => {
    if (div.querySelector('h3') && div.querySelector('h3').textContent === item.name) {
      div.innerHTML = "";
      div.appendChild(container);
    }
  });

  // ตั้งค่า select หมวดหมู่
  document.getElementById('editCategory').value = item.category;

  // ปุ่มบันทึกแก้ไข
  document.getElementById('saveEditBtn').onclick = () => {
    const newCategory = document.getElementById('editCategory').value;
    const newName = document.getElementById('editName').value.trim();
    const newDesc = document.getElementById('editDesc').value.trim();
    const newLink = document.getElementById('editLink').value.trim();

    if (newName === "") {
      alert("กรุณาใส่ชื่อเมนู");
      return;
    }

    item.category = newCategory;
    item.name = newName;
    item.description = newDesc;
    item.link = newLink;

    saveMenu();
    renderMenu();
  };

  // ปุ่มยกเลิก
  document.getElementById('cancelEditBtn').onclick = () => {
    renderMenu();
  };
}

// ลบเมนู
function deleteMenuItem(id) {
  if (!confirm("คุณแน่ใจว่าต้องการลบเมนูนี้?")) return;

  menuData = menuData.filter(item => item.id !== id);
  saveMenu();
  renderMenu();
}

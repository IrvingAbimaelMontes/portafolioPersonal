// Clave de almacenamiento
const STORAGE_KEY = 'tareas';


let tareas = [];

// Utilidades de almacenamiento
function cargarTareas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tareas = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(tareas)) tareas = [];
  } catch (e) {
    tareas = [];
    console.error('Error al leer LocalStorage:', e);
  }
}

function guardarTareas() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
  } catch (e) {
    console.error('Error al guardar en LocalStorage:', e);
    throw new Error('No se pudo guardar en el navegador.');
  }
}

// Render de la tabla dinamica para mostrar las tareas
function renderTareas(lista = tareas) {
  const tbody = document.getElementById('tbodyTareas');
  const contador = document.getElementById('contador');
  tbody.innerHTML = '';

  if (!lista.length) {
    const tr = document.createElement('tr');
    tr.className = 'empty';
    tr.innerHTML = `<td colspan="3">Sin tareas por ahora.</td>`;
    tbody.appendChild(tr);
  } else {
    for (const t of lista) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(t.titulo)}</td>
        <td>${escapeHtml(t.descripcion || '')}</td>
        <td>${formatearFecha(t.vencimiento)}</td>
      `;
      tbody.appendChild(tr);
    }
  }
  contador.textContent = `${lista.length} tarea${lista.length === 1 ? '' : 's'}`;
}

function mostrarMensaje(texto, tipo = 'ok') {
  const box = document.getElementById('mensaje');
  box.textContent = texto;
  box.className = `msg ${tipo === 'ok' ? 'ok' : 'err'}`;
}

function limpiarMensaje() {
  const box = document.getElementById('mensaje');
  box.textContent = '';
  box.className = 'msg';
}


function normalizarTitulo(t) { return String(t || '').trim().toLowerCase(); }
function formatearFecha(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString();
  } catch { return ''; }
}
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}


// Función para agregar una nueva tarea
function agregarTarea(e) {
  e.preventDefault();
  limpiarMensaje();

  try {
    const form = document.getElementById('formTarea');
    const tituloEl = document.getElementById('titulo');
    const descEl = document.getElementById('descripcion');
    const vencEl = document.getElementById('vencimiento');

    const titulo = tituloEl.value.trim();
    const descripcion = descEl.value.trim();
    const vencimiento = vencEl.value;

    // Validaciones
    if (!titulo) throw new Error('El título es obligatorio.');
    if (!vencimiento) throw new Error('La fecha de vencimiento es obligatoria.');

    // Duplicados por título
    const existe = tareas.some(t => normalizarTitulo(t.titulo) === normalizarTitulo(titulo));
    if (existe) throw new Error('Ya existe una tarea con ese título.');

    const nueva = { titulo, descripcion, vencimiento };
    tareas.push(nueva);
    guardarTareas();
    renderTareas();

    // Notificación y limpieza del formulario
    mostrarMensaje('Tarea agregada correctamente.', 'ok');
    form.reset();
    tituloEl.focus();
  } catch (err) {
    mostrarMensaje(err.message || 'Ocurrió un error al agregar la tarea.', 'err');
  }
}
//  Función para buscar una tarea por título
function buscarTarea() {
  limpiarMensaje();
  try {
    const titulo = document.getElementById('titulo').value.trim();
    if (!titulo) throw new Error('Indica el título a buscar.');
    const key = normalizarTitulo(titulo);
    const encontrada = tareas.filter(t => normalizarTitulo(t.titulo) === key);

    if (!encontrada.length) {
      renderTareas([]);
      throw new Error('No se encontró una tarea con ese título.');
    }

    renderTareas(encontrada);
    mostrarMensaje('1 tarea encontrada.', 'ok');
  } catch (err) {
    mostrarMensaje(err.message || 'Error al buscar.', 'err');
  }
}
//funcion para eliminar una tarea por título
function eliminarTarea() {
  limpiarMensaje();
  try {
    const titulo = document.getElementById('titulo').value.trim();
    if (!titulo) throw new Error('Indica el título a eliminar.');

    const key = normalizarTitulo(titulo);
    const antes = tareas.length;
    tareas = tareas.filter(t => normalizarTitulo(t.titulo) !== key);

    if (tareas.length === antes) throw new Error('No existe una tarea con ese título.');

    guardarTareas();
    renderTareas();
    mostrarMensaje('Tarea eliminada correctamente.', 'ok');
  } catch (err) {
    mostrarMensaje(err.message || 'Error al eliminar.', 'err');
  }
}

function verTodas() { limpiarMensaje(); renderTareas(); }

// Bootstrap de la app
window.addEventListener('DOMContentLoaded', () => {
  cargarTareas();
  renderTareas();


  document.getElementById('formTarea').addEventListener('submit', agregarTarea);
  document.getElementById('btnBuscar').addEventListener('click', buscarTarea);
  document.getElementById('btnEliminar').addEventListener('click', eliminarTarea);
  document.getElementById('btnVerTodo').addEventListener('click', verTodas);
});
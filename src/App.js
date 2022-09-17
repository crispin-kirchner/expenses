import * as Calendar from './Calendar.js';
import * as DayExpenses from './DayExpenses.js';
import * as Fab from './Fab.js';
import * as Form from './Form.js';
import * as FormState from './FormState.js';
import * as LoadState from './LoadState.js';
import * as ManageTags from './ManageTags.js';
import * as Migration from './Migration.js';
import * as MonthChart from './MonthChart.js';
import * as Navbar from './Navbar.js';
import * as Overview from './Overview.js';
import * as SearchResults from './SearchResults.js';
import * as ViewMode from './ViewMode.js';
import * as constants from './constants.js';
import * as currencies from './currencies.js';
import * as dates from './dates.js';
import * as db from './db.js';
import * as labels from './labels.js';
import * as positions from './positions.js';

import ExpensesError from './ExpensesError.js';
import state from './state.js';

document.onkeydown = e => {
  if (e.key === 'Enter') {
    if (['description', 'amount', 'currency-input', 'date-input', 'exchange-rate', 'recurring-checkbox', 'recurring-frequency', 'recurring-monthly', 'recurring-yearly', 'recurring-from', 'recurring-to', 'type-select'].includes(e.target.id)) {
      if (e.ctrlKey) {
        Form.submit();
      }
      // disable Enter-only for submitting
      return false;
    }
  }
  if (e.key === 'Escape') {
    cancelLineEdit();
    return false;
  }
  if (e.ctrlKey) {
    if (e.key === 'Insert') {
      startNew();
      return false;
    }
  }
  return true;
};

/*
 * Data store
 */
function setDate(date) {
  if (dates.isSameDay(date, state.date)) {
    return;
  }
  if (!dates.isSameMonth(date, state.date)) {
    state.daysOfMonth.loadState = LoadState.DIRTY;
    state.overviewData.loadState = LoadState.DIRTY;
  }
  state.dayExpenses.loadState = LoadState.DIRTY;
  state.date = date;
  render();
}

function getCurrentDayString() {
  return dates.toYmd(state.date);
}

/*
 * UI
 */

function getLabelByField(fieldId) {
  return document.querySelector(`label[for="${fieldId}"]`);
}

function getAppArea() {
  return document.getElementById('app-area');
}

function getNavbar() {
  return document.getElementById('navbar');
}

function renderInteger(i) {
  return constants.bigNumberFormat.format(i);
}

function renderFloat(f) {
  return constants.numberFormat.format(f);
}

function renderDay(date) {
  return constants.dayFormat.format(date);
}

function renderHeading(level, label, amount) {
  return `
    <${level} class="d-flex">
        <span class="me-auto">
            ${label}
        </span>
        <span>
            ${isSubCent(amount) ? '' : renderFloat(amount)}
        </span>
        <span class="currency"></span>
    </${level}>`;
}

function renderPositionRow(pos, labelFormatter, classes, attributes) {
  classes = classes || 'py-1 border-top xpns-hover';
  let label = decorateTags(pos.description, l => `<div class="overflow-hidden me-1">${l}</div>`);
  if (labelFormatter) {
    label = labelFormatter(label);
  }
  return `
    <div data-xpns-id="${pos._id}" class="d-flex cursor-pointer ${classes || ''}" ${attributes || ''}>
        <div class="d-flex overflow-hidden text-nowrap me-auto">
            ${label}
        </div>
        <div class="pe-1 text-end">${renderFloat(positions.computeMonthlyAmount(pos))}</div>
        <div class="currency">${currencies.isDefault(pos.currency) ? '' : currencies.definitions[pos.currency].displayName}</div>
    </div>`;
}

function renderDayHeadingDate(date) {
  return constants.dayHeadingFormat.format(date);
}

function decorateTags(text, wrapperFunction) {
  wrapperFunction = wrapperFunction || (x => x);

  const parts = [];
  for (let i = 0, m; (m = constants.labelRegex.exec(text)); ++i) {
    if (i === 0 && m.index > 0) {
      parts.push(text.substring(0, m.index).trim());
    }
    parts.push(labels.render(m[1]));
    ++i;
  }
  if (parts.length === 0) {
    parts.push(text);
  }

  return parts
    .map(wrapperFunction)
    .join(' ');
}

function setMonthDisplay(monthDisplay) {
  if (monthDisplay === state.monthDisplay) {
    return;
  }
  state.monthDisplay = monthDisplay;
  localStorage.setItem(ViewMode.MONTH_DISPLAY, monthDisplay);
  render();
}

function setViewMode(viewMode) {
  state.form = null;
  state.viewMode = viewMode;
  render();
}

const mainAreaItems = {
  overview: {
    icon: 'columns',
    name: 'Übersicht',
    object: Overview
  },
  calendar: {
    icon: 'calendar3',
    name: 'Kalender',
    object: Calendar
  },
  chart: {
    icon: 'graph-up',
    name: 'Diagramm',
    object: MonthChart
  }
};

function renderMainArea() {
  const lis = Object.entries(mainAreaItems)
    .map(en => {
      const [item, props] = en;
      return `
        <li class="nav-item">
            <a class="nav-link ${state.monthDisplay === item ? 'active' : ''}" onclick="setMonthDisplay('${item}');" href="#"><i class="bi-${props.icon}"></i><span class="d-none d-sm-inline">&nbsp;${props.name}</span></a>
        </li>`;
    });

  const content = mainAreaItems[state.monthDisplay].object.render();

  return `
        <div class="col-lg-8 mt-content">
            <ul class="nav nav-tabs">
                ${lis.join('\n')}
            </ul>
            <div class="mb-4">
                ${content}
            </div>
        </div>`;
}

function renderAppArea() {
  let appArea;
  if (state.viewMode === ViewMode.MONTH_DISPLAY) {
    const mainArea = renderMainArea();
    const dayTable = DayExpenses.render();
    appArea = mainArea + dayTable
  } else if (state.viewMode === ViewMode.MANAGE_TAGS) {
    appArea = ManageTags.render();
  } else if (state.viewMode === ViewMode.SEARCH) {
    appArea = SearchResults.render();
  }
  if (state.viewMode !== ViewMode.MANAGE_TAGS) {
    appArea += Form.render();
  }
  appArea += Fab.render();
  getAppArea().innerHTML = appArea;

  const expenseElems = document.querySelectorAll('[data-xpns-id]:not([data-xpns-id=""])');
  for (const elem of expenseElems) {
    elem.addEventListener('click', editExpense);
  }
}

function isPositionFormVisible() {
  return state.viewMode !== ViewMode.MANAGE_TAGS && state.form && state.editedPosition.loadState === LoadState.LOADED;
}

function render(keepNavbar) {
  labels.refresh();
  if (!keepNavbar) {
    getNavbar().innerHTML = Navbar.render();
    Navbar.onAttach();
  }

  renderAppArea();

  if (state.viewMode === ViewMode.MANAGE_TAGS) {
    ManageTags.onAttach();
  }
  if (state.viewMode === ViewMode.MONTH_DISPLAY) {
    mainAreaItems[state.monthDisplay].object.onAttach();
  }
  if (isPositionFormVisible()) {
    Form.onAttach();
  }
  Fab.onAttach();

  const collapsibles = document.querySelectorAll('.collapse');
  if (collapsibles) {
    collapsibles.forEach(n => {
      n.addEventListener('show.bs.collapse', e => { saveExpandedPath(e.target.id); });
      n.addEventListener('hide.bs.collapse', e => { removeExpandedPath(e.target.id); });
    });
  }
}

function saveExpandedPath(newPath) {
  const components = newPath.split('-');

  let expandedPath = state.expandedPaths;
  for (let component of components) {
    expandedPath = (expandedPath[component] = expandedPath[component] || {});
  }
}

function removeExpandedPath(path) {
  const components = path.split('-');

  let expandedPath = state.expandedPaths;
  components.forEach((component, i) => {
    if (i === components.length - 1) {
      expandedPath[component] = null;
      return;
    }
    expandedPath = expandedPath[component];
  });
}

function isSubCent(amount) {
  return amount < constants.SUB_CENT;
}

function editExpense(evt) {
  evt.preventDefault();

  startEditPosition(evt.currentTarget.dataset.xpnsId);
}

function startNew() {
  state.form = FormState.NEW;
  state.editedPosition.data = positions.prepareCreate();
  state.editedPosition.loadState = LoadState.LOADED;
  render();
}

function startEditPosition(id) {
  state.form = FormState.EDIT;
  state.editedPosition.data = { _id: id };
  state.editedPosition.loadState = LoadState.DIRTY;
  render();
}

function cancelLineEdit() {
  state.form = null;
  state.editedPosition.loadState = LoadState.LOADED;
  state.editedPosition.data = null;
  render();
}

async function removeExpense() {
  await positions.deletePosition(state.editedPosition.data);

  state.form = null;
  state.editedPosition.loadState = LoadState.LOADED;
  state.editedPosition.data = null;
  render();
}

window.onerror = (msg, url, lineNo, columnNo, error) => {
  if (error instanceof ExpensesError) {
    error.origins.forEach(o => o.classList.add('error'))
    alert(error.message);
    return;
  }
  throw error;
};

async function onAttach() {
  window.setMonthDisplay = setMonthDisplay;

  if (process.env.NODE_ENV === 'development') {
    document.title += ' *** DEV ***';
  }

  await Migration.migrate();
  db.setupApplicationDb();

  render();
}

function isNewButtonVisible() {
  return state.viewMode === ViewMode.MONTH_DISPLAY;
}

function reverseCompareString(fn) {
  if (fn) {
    return (a, b) => fn(b).localeCompare(fn(a));
  }
  return (a, b) => b.localeCompare(a);
}

export {
  cancelLineEdit,
  decorateTags,
  getCurrentDayString,
  getLabelByField,
  isPositionFormVisible,
  isNewButtonVisible,
  isSubCent,
  removeExpense,
  render,
  renderAppArea,
  renderDay,
  renderHeading,
  renderDayHeadingDate,
  renderFloat,
  renderInteger,
  renderPositionRow,
  reverseCompareString,
  setDate,
  setMonthDisplay,
  setViewMode,
  startEditPosition,
  startNew,
  onAttach
};

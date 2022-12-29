import { formatCalendarWeekday, formatDay, formatFloat, formatInteger } from "../utils/formats";
import { getFirstDayOfMonth, getFirstDayOfWeek, getLastDayOfMonth, getLastDayOfWeek, isSameDay, isSameMonth, toYmd } from "../utils/dates";

import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import _ from 'lodash';

function DayNumber({ date, isCurrentMonth }) {
  return (
    <div className="position-absolute d-flex top-0 start-0 small lh-small">
      <div className={`${isCurrentMonth ? 'bg-dark' : 'bg-secondary'} text-light rounded-tlbr-1 me-1 text-center`} style={{ width: '1.4rem' }}>
        {formatDay(date)}
      </div>
      <div className={isCurrentMonth ? '' : 'text-secondary'}>
        {formatCalendarWeekday(date)}
      </div>
    </div>
  );
}

function DayAmount({ amount }) {
  return <>
    <span className="d-md-none">{formatInteger(amount)}</span>
    <span className="d-none d-md-inline">{formatFloat(amount)}</span>
  </>;
}

function DayAmounts({ positions }) {
  let spent = '';
  if (positions) {
    if (positions.positions.length === 0) {
      spent = '&ndash;&ndash;';
    }
    else {
      spent = <DayAmount amount={positions.expensesSum} />
    }
  }

  return (
    <div className="position-absolute bottom-0 end-0 text-end p-05 sm-small lh-1 lh-md-base w-100">
      <span className="w-100 d-inline-flex justify-content-between">
        <i className="bi-box-arrow-right"></i>
        {spent}
      </span>
      <br />
      <span className="w-100 d-inline-flex justify-content-between">
        <i className="bi bi-piggy-bank"></i>
      </span>
    </div>
  );
}

function getBorderClasses({ isCurrentMonth, isWeekend, isToday }) {
  if (isToday) {
    return 'border-warning';
  }
  if (isWeekend && isCurrentMonth) {
    return 'border-success';
  }
  if (!isCurrentMonth) {
    return 'border-light';
  }
  return '';
}

function getBgClasses({ isSelectedDate, isToday, isWeekend, isCurrentMonth }) {
  if (isSelectedDate) {
    return 'active';
  }
  if (isToday) {
    return 'bg-warning bg-opacity-10';
  }
  if (isWeekend && isCurrentMonth) {
    return 'bg-success bg-opacity-25';
  }
  return '';
}

function Day({ date, selectedDate, today, setDate, positions }) {
  const isCurrentMonth = isSameMonth(date, selectedDate);
  const isSelectedDate = isSameDay(date, selectedDate);
  const isToday = isSameDay(date, today);
  const isFuture = date > today;
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const classification = { isCurrentMonth, isSelectedDate, isToday, isWeekend }

  return (
    <Col className="gx-1 gy-1">
      <div
        className={`ratio ratio-1x1 position-relative border rounded xpns-hover cursor-pointer ${getBorderClasses(classification)} ${getBgClasses(classification)} `}
        onClick={() => setDate(date)}>
        <div>
          <DayNumber date={date} isCurrentMonth={isCurrentMonth} />
          {isCurrentMonth && !isFuture ? <DayAmounts positions={positions} /> : null}
        </div>
      </div>
    </Col>
  );
}

function Week({ monday, date, today, setDate, positionsByDay }) {
  return (
    <Row>
      {_.range(7)
        .map(i => {
          const currentDay = new Date(monday);
          currentDay.setDate(currentDay.getDate() + i);

          const positions = positionsByDay?.[toYmd(currentDay)];

          return <Day key={i} date={currentDay} selectedDate={date} today={today} setDate={setDate} positions={positions} />;
        })}
    </Row>
  );
}

// TODO suspense
// TODO auf kleinen devices gutter entfernen, borders collapsen, schauen was noch nötig ist (landscape)
// TODO Formatting für saved
export default function Calendar({ date, setDate, positionsByDay }) {
  const firstDayOfMonth = getFirstDayOfMonth(date);
  const lastDayOfMonth = getLastDayOfMonth(date);
  const firstDayOfCalendar = getFirstDayOfWeek(firstDayOfMonth);
  const lastDayOfCalendar = getLastDayOfWeek(lastDayOfMonth);

  const today = new Date();

  const mondays = [];
  for (const currentMonday = new Date(firstDayOfCalendar)
    ; currentMonday <= lastDayOfCalendar
    ; currentMonday.setDate(currentMonday.getDate() + 7)) {

    mondays.push(new Date(currentMonday));
  }

  return (
    <Container>
      {mondays.map(m => <Week key={m} monday={m} date={date} today={today} setDate={setDate} positionsByDay={positionsByDay} />)}
    </Container>
  );
}
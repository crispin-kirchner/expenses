import { formatCalendarMonth, formatDay, formatFloat, formatInteger } from "../utils/formats";
import { getFirstDayOfMonth, getFirstDayOfWeek, getLastDayOfMonth, getLastDayOfWeek, isSameDay, isSameMonth, toYmd } from "../utils/dates";

import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import _ from 'lodash';

function DayNumber({ date, renderMonth, isCurrentMonth }) {
  return (
    <div className="position-absolute d-flex top-0 start-0 small lh-small">
      <div className={`${isCurrentMonth ? 'bg-dark' : 'bg-secondary'} text-light rounded-tl-lg-1 rounded-br-1 me-1 text-center`} style={{ width: '1.4rem' }}>
        {formatDay(date)}
      </div>
      <div className={isCurrentMonth ? '' : 'text-secondary'}>
        {renderMonth ? formatCalendarMonth(date) : ''}
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
  let spent = null;
  let saved = null;
  let savedClasses = 'text-success';
  let savedIcon = 'piggy-bank';
  if (positions) {
    if (positions.positions.length === 0) {
      spent = <>&ndash;&ndash;</>;
      savedIcon = 'piggy-bank-fill';
    }
    else {
      spent = <DayAmount amount={positions.expensesSum} />
      if (positions.saved < 0) {
        savedClasses = 'text-danger';
      }
    }
    saved = <DayAmount amount={positions.saved} />;
  }

  return (
    <div className="position-absolute bottom-0 end-0 text-end p-05 lh-1 lh-md-base w-100">
      <span className="w-100 d-inline-flex justify-content-between">
        <i className="bi-box-arrow-right"></i>
        {spent}
      </span>
      <br />
      <span className={`w-100 d-inline-flex justify-content-between ${savedClasses}`}>
        <i className={`bi bi-${savedIcon}`}></i>
        {saved}
      </span>
    </div>
  );
}

function getBorderClasses({ isCurrentMonth, isWeekend, isToday }) {
  if (isToday) {
    return 'border-lg-warning';
  }
  if (isWeekend && isCurrentMonth) {
    return 'border-lg-success';
  }
  if (!isCurrentMonth) {
    return 'border-lg-light';
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

function Day({ renderMonth, date, selectedDate, today, setDate, positions }) {
  const isCurrentMonth = isSameMonth(date, selectedDate);
  const isSelectedDate = isSameDay(date, selectedDate);
  const isToday = isSameDay(date, today);
  const isFuture = date > today;
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const classification = { isCurrentMonth, isSelectedDate, isToday, isWeekend }

  return (
    <Col className="gx-0 gx-lg-1 gy-0 gy-lg-1 fs-calendar">
      <div
        className={`ratio ratio-1x1 position-relative border-lg rounded-lg xpns-hover cursor-pointer ${getBorderClasses(classification)} ${getBgClasses(classification)} `}
        onClick={() => setDate(date)}>
        <div>
          <DayNumber renderMonth={renderMonth} date={date} isCurrentMonth={isCurrentMonth} />
          {isCurrentMonth && !isFuture ? <DayAmounts positions={positions} /> : null}
        </div>
      </div>
    </Col>
  );
}

function Week({ weekIndex, monday, date, today, setDate, positionsByDay }) {
  return (
    <Row>
      {_.range(7)
        .map(dayIndex => {
          const currentDay = new Date(monday);
          currentDay.setDate(currentDay.getDate() + dayIndex);

          const renderMonth = (weekIndex === 0 && dayIndex === 0) || currentDay.getDate() === 1;

          const positions = positionsByDay?.[toYmd(currentDay)];

          return <Day key={dayIndex} date={currentDay} renderMonth={renderMonth} selectedDate={date} today={today} setDate={setDate} positions={positions} />;
        })}
    </Row>
  );
}

// TODO suspense
// TODO auf kleinen devices gutter entfernen, borders entfernen, schauen was noch nötig ist (landscape)
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
      {mondays.map((m, i) => <Week key={i} weekIndex={i} monday={m} date={date} today={today} setDate={setDate} positionsByDay={positionsByDay} />)}
    </Container>
  );
}

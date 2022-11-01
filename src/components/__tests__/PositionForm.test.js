import currencies, { DEFAULT_CURRENCY, EUR } from '../../enums/currencies.js';
import { render, screen } from '@testing-library/react';

import PositionForm from '../PositionForm.js';
import React from 'react';
import RecurrencePeriodicity from '../../enums/RecurrencePeriodicity.js';
import { createEmptyPosition } from '../../utils/positions.js';
import t from '../../utils/texts.js';
import userEvent from '@testing-library/user-event';

it('loads all fields of the position correctly', () => {
    const AMOUNT = '12.25';
    const DESCRIPTION = 'Beschreibung #tageins #tagzwei';
    const CURRENCY = EUR;
    const EXCHANGE_RATE = '1.23450'
    const RECURRENCE_FROM_STR = '2022-10-07';
    const RECURRENCE_TO_STR = '2023-10-07';
    const RECURRING = true;
    const RECURRENCE_FREQUENCY = 2;

    const position = createEmptyPosition();
    position.amount = AMOUNT;
    position.description = DESCRIPTION;
    position.currency = CURRENCY;
    position.exchangeRate = EXCHANGE_RATE;
    position.recurring = RECURRING;
    position.recurrenceFrom = new Date(RECURRENCE_FROM_STR);
    position.recurrenceTo = new Date(RECURRENCE_TO_STR);
    position.recurrenceFrequency = RECURRENCE_FREQUENCY;
    position.recurrencePeriodicity = RecurrencePeriodicity.MONTHLY;

    render(<PositionForm position={position} />);

    // TODO check type "select"
    expect(screen.getByLabelText(t('Amount'))).toHaveValue(AMOUNT);
    expect(screen.getByLabelText(t('Currency'))).toHaveValue(CURRENCY);
    expect(screen.getByLabelText(t('Currency'))).toHaveDisplayValue(currencies[EUR].isoCode);
    expect(screen.getByLabelText(t('ExchangeRate'))).toHaveValue(EXCHANGE_RATE);
    expect(screen.getByTestId('chf-amount')).toHaveTextContent('15.12 ' + currencies[DEFAULT_CURRENCY].displayName);
    expect(screen.getByLabelText(t('Beneficiary') + '/' + t('Description'))).toHaveValue(DESCRIPTION)
    expect(screen.getByLabelText(t('Start'))).toHaveValue(RECURRENCE_FROM_STR);
    expect(screen.getByLabelText(t('End'))).toHaveValue(RECURRENCE_TO_STR);
    expect(screen.getByLabelText(t('Recurring'))).toBeChecked();
    expect(screen.getByTestId('recurrence-frequency')).toHaveValue(RECURRENCE_FREQUENCY);
    expect(screen.getByLabelText(t('Monthly'))).toBeChecked();
});

it('changes label of date input according to recurrence', () => {
    const position = createEmptyPosition();

    // TODO implement
    // const user = userEvent.setup();

    render(<PositionForm position={position} />);

    expect(screen.get)
});

it('keeps form inputs when they become invisible but does not store their values', () => {
    // TODO implement
});

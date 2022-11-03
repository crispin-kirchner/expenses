import * as PositionType from '../../enums/PositionType.js';

import currencies, { DEFAULT_CURRENCY, EUR } from '../../enums/currencies.js';
import { render, screen } from '@testing-library/react';

import PositionForm from '../PositionForm.js';
import React from 'react';
import RecurrencePeriodicity from '../../enums/RecurrencePeriodicity.js';
import { createEmptyPosition } from '../../utils/positions.js';
import t from '../../utils/texts.js';
import { type } from '@testing-library/user-event/dist/type/index.js';
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
    position.type = PositionType.INCOME;
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

    const typeDropdowns = screen.getAllByTestId('type-dropdown');
    expect(typeDropdowns[0]).toHaveTextContent(t('Earning'));
    expect(typeDropdowns[1]).toHaveTextContent(t('Earning'));
    expect(screen.getByLabelText(t('Amount'))).toHaveValue(AMOUNT);
    expect(screen.getByLabelText(t('Currency'))).toHaveValue(CURRENCY);
    expect(screen.getByLabelText(t('Currency'))).toHaveDisplayValue(currencies[EUR].isoCode);
    expect(screen.getByLabelText(t('ExchangeRate'))).toHaveValue(EXCHANGE_RATE);
    expect(screen.getByTestId('chf-amount')).toHaveTextContent('15.12 ' + currencies[DEFAULT_CURRENCY].displayName);
    expect(screen.getByLabelText(t('Payer') + '/' + t('Description'))).toHaveValue(DESCRIPTION);
    expect(screen.getByLabelText(t('Start'))).toHaveValue(RECURRENCE_FROM_STR);
    expect(screen.getByLabelText(t('End'))).toHaveValue(RECURRENCE_TO_STR);
    expect(screen.getByLabelText(t('Recurring'))).toBeChecked();
    expect(screen.getByTestId('recurrence-frequency')).toHaveValue(RECURRENCE_FREQUENCY);
    expect(screen.getByLabelText(t('Monthly'))).toBeChecked();
});

it('saves default values when invisible', async () => {
    const inputPosition = createEmptyPosition();
    const saveAction = jest.fn();

    render(<PositionForm position={inputPosition} saveAction={saveAction} />);

    // TODO continue (keyboard input)
    await userEvent.type(screen.getByLabelText(t('Amount')), '15');

    await userEvent.click(screen.getAllByText(t('Save'))[0]);

    const { amount } = saveAction.mock.calls[0][0];

    expect(saveAction).toHaveBeenCalledTimes(1);
    expect(amount).toBe('15.00');
});

it('saves with both save buttons', async () => {
    const position = createEmptyPosition();
    const saveAction = jest.fn();

    render(<PositionForm position={position} saveAction={saveAction} />);

    const saveButtons = screen.getAllByText(t('Save'));
    await userEvent.click(saveButtons[0]);
    expect(saveAction).toHaveBeenCalledTimes(1);

    await userEvent.click(saveButtons[1]);
    expect(saveAction).toHaveBeenCalledTimes(2);
});

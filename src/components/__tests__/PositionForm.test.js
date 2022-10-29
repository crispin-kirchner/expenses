import { render, screen } from '@testing-library/react';

import PositionForm from '../PositionForm.js';
import React from 'react';
import { createEmptyPosition } from '../../utils/positions.js';
import currencies from '../../enums/currencies.js';

it('loads all fields of the position correctly', () => {
    const DESCRIPTION = 'Beschreibung #tageins #tagzwei';
    const CURRENCY = 'e190e651-a073-449d-b674-8ececd2f096e';
    const EXCHANGE_RATE = '1.23450'

    const position = createEmptyPosition();
    position.description = DESCRIPTION;
    position.currency = CURRENCY;
    position.exchangeRate = EXCHANGE_RATE;
    position.recurring = true;

    render(<PositionForm position={position} />);

    // FIXME use text keys
    expect(screen.getByLabelText('Beneficiary/Description')).toHaveValue(DESCRIPTION)
    expect(screen.getByLabelText('Currency')).toHaveValue(CURRENCY);
    expect(screen.getByLabelText('Currency')).toHaveDisplayValue('EUR');
    expect(screen.getByLabelText('Exchange rate')).toHaveValue(EXCHANGE_RATE);
});

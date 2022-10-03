import * as labels from './labels.js';

it('decorates even a single hash', () => {
    expect(labels.decorateTags('Test #')).toEqual('Test <span class="badge"></span>');
});

it('keeps the cursor', () => {
    // FIXME implement
});

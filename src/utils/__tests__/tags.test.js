import { buildHierarchyRecursive, removeTagFromString } from "../tags.js";

it('builds hierarchy correctly', () => {
    const tags = [
        {
            _id: 'lebensmittel',
            parent: 'Standard'
        },
        {
            _id: 'bio',
            parent: 'lebensmittel'
        },
        {
            _id: 'restaurant',
            parent: 'lebensmittel'
        },
        {
            _id: 'luxus',
            parent: 'restaurant'
        },
        {
            _id: 'mobilität',
            parent: 'Standard'
        },
        {
            _id: 'velo',
            parent: 'mobilität'
        }
    ];

    const hierarchy = buildHierarchyRecursive(tags, 'Standard');
    const expectedHierarchy = {
        lebensmittel: {
            bio: {},
            restaurant: {
                luxus: {}
            }
        },
        mobilität: {
            velo: {}
        }
    };

    expect(hierarchy).toEqual(expectedHierarchy);
});

it('removes tags', () => {
    expect(removeTagFromString('lebensmittel', 'WerkStadt Lorraine #lebensmittel #restaurant')).toEqual('WerkStadt Lorraine #restaurant');
});

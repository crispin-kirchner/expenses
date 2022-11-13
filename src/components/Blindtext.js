import React from 'react';

// TODO remove

const paragraphs = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sollicitudin nibh sit amet commodo nulla facilisi nullam. Habitant morbi tristique senectus et netus. Interdum velit laoreet id donec ultrices tincidunt arcu non sodales. Diam donec adipiscing tristique risus nec. Nunc mi ipsum faucibus vitae aliquet nec. Ut venenatis tellus in metus vulputate. Orci eu lobortis elementum nibh. Dui nunc mattis enim ut. Duis at consectetur lorem donec massa sapien. Eget nulla facilisi etiam dignissim diam.',
    'Sem integer vitae justo eget. Tellus at urna condimentum mattis pellentesque id nibh tortor. Bibendum est ultricies integer quis auctor elit sed. Quis risus sed vulputate odio ut enim blandit. Non nisi est sit amet facilisis magna. Erat velit scelerisque in dictum non consectetur a. Semper risus in hendrerit gravida rutrum. Duis convallis convallis tellus id interdum velit. Et malesuada fames ac turpis egestas maecenas pharetra. Enim sit amet venenatis urna cursus eget. Vel orci porta non pulvinar neque laoreet. Massa placerat duis ultricies lacus. Mi tempus imperdiet nulla malesuada. Eu non diam phasellus vestibulum. Adipiscing elit pellentesque habitant morbi tristique. Dolor sit amet consectetur adipiscing elit pellentesque habitant morbi tristique. Eget aliquet nibh praesent tristique magna sit amet. Gravida neque convallis a cras semper auctor neque vitae tempus.',
    'Pulvinar elementum integer enim neque volutpat ac tincidunt vitae semper. Orci a scelerisque purus semper eget duis at tellus. Eget est lorem ipsum dolor sit amet consectetur adipiscing elit. Id diam maecenas ultricies mi eget mauris pharetra. Nisl rhoncus mattis rhoncus urna. Pulvinar mattis nunc sed blandit libero volutpat sed. Elementum tempus egestas sed sed risus pretium. Ac tortor vitae purus faucibus. Sem nulla pharetra diam sit amet. Blandit libero volutpat sed cras ornare arcu. Amet justo donec enim diam vulputate. Rutrum quisque non tellus orci ac auctor augue mauris augue.',
    'At ultrices mi tempus imperdiet nulla malesuada. A iaculis at erat pellentesque adipiscing commodo elit. Volutpat odio facilisis mauris sit amet. Sit amet mauris commodo quis. Ullamcorper a lacus vestibulum sed arcu non odio euismod. Enim diam vulputate ut pharetra sit. A diam sollicitudin tempor id eu. Et netus et malesuada fames ac turpis egestas integer. Ut venenatis tellus in metus vulputate eu. Vivamus arcu felis bibendum ut tristique et egestas. Sagittis aliquam malesuada bibendum arcu.',
    'Tempus urna et pharetra pharetra massa massa ultricies mi quis. Sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus. Diam maecenas ultricies mi eget mauris pharetra et. Lobortis feugiat vivamus at augue eget arcu dictum. Blandit cursus risus at ultrices mi tempus. Ipsum dolor sit amet consectetur adipiscing. Ultricies integer quis auctor elit sed. Volutpat lacus laoreet non curabitur gravida arcu ac tortor dignissim. Pellentesque pulvinar pellentesque habitant morbi tristique senectus et netus. Tincidunt lobortis feugiat vivamus at augue eget arcu dictum varius. Malesuada fames ac turpis egestas maecenas pharetra. Amet aliquam id diam maecenas ultricies mi eget. Eget aliquet nibh praesent tristique. Erat nam at lectus urna duis convallis.',
    'Pellentesque nec nam aliquam sem et tortor consequat id porta. Ut etiam sit amet nisl. Egestas congue quisque egestas diam in arcu. Scelerisque purus semper eget duis. Non sodales neque sodales ut etiam sit amet. Tincidunt tortor aliquam nulla facilisi. Fringilla ut morbi tincidunt augue. Volutpat odio facilisis mauris sit amet massa. Consectetur purus ut faucibus pulvinar elementum integer. Id faucibus nisl tincidunt eget nullam non nisi est sit. Convallis aenean et tortor at risus.',
    'Ullamcorper dignissim cras tincidunt lobortis. Commodo odio aenean sed adipiscing diam donec adipiscing. Justo donec enim diam vulputate ut pharetra sit. Ac placerat vestibulum lectus mauris ultrices eros. Sem viverra aliquet eget sit. Ac odio tempor orci dapibus ultrices in. Massa tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada proin. Volutpat sed cras ornare arcu dui. Eget mi proin sed libero enim sed faucibus. Aliquam eleifend mi in nulla posuere sollicitudin aliquam. Urna nec tincidunt praesent semper. Dictum at tempor commodo ullamcorper a lacus vestibulum sed. Libero justo laoreet sit amet cursus. Ut ornare lectus sit amet. Et leo duis ut diam quam. Interdum varius sit amet mattis. Feugiat pretium nibh ipsum consequat nisl vel pretium. Tellus mauris a diam maecenas. Vitae turpis massa sed elementum tempus egestas sed sed.',
    'Pharetra pharetra massa massa ultricies mi quis hendrerit. Id aliquet risus feugiat in ante metus dictum at. In fermentum posuere urna nec. Dictumst quisque sagittis purus sit amet volutpat. Nulla facilisi cras fermentum odio eu feugiat pretium. Et egestas quis ipsum suspendisse. Ultrices in iaculis nunc sed augue. Amet venenatis urna cursus eget. Quis blandit turpis cursus in hac habitasse platea. Sed elementum tempus egestas sed sed risus pretium. Velit egestas dui id ornare. Massa tempor nec feugiat nisl pretium. Faucibus turpis in eu mi bibendum neque egestas congue quisque. Neque aliquam vestibulum morbi blandit cursus risus. Leo in vitae turpis massa sed. Aliquet porttitor lacus luctus accumsan tortor posuere ac ut consequat.',
    'Volutpat ac tincidunt vitae semper quis lectus nulla at. Enim nulla aliquet porttitor lacus luctus accumsan tortor. Libero nunc consequat interdum varius sit amet mattis. Bibendum neque egestas congue quisque egestas diam in arcu cursus. Tortor aliquam nulla facilisi cras fermentum odio eu. Amet nisl purus in mollis. Dignissim cras tincidunt lobortis feugiat vivamus at augue eget. Non enim praesent elementum facilisis leo. In nulla posuere sollicitudin aliquam ultrices sagittis orci a scelerisque. Quis lectus nulla at volutpat diam. Eleifend quam adipiscing vitae proin sagittis nisl rhoncus mattis. Quis viverra nibh cras pulvinar mattis nunc sed. Semper quis lectus nulla at volutpat diam. Tincidunt dui ut ornare lectus sit amet est. Imperdiet dui accumsan sit amet nulla. Ridiculus mus mauris vitae ultricies leo integer malesuada nunc.',
    'Elementum nibh tellus molestie nunc non blandit. Tincidunt dui ut ornare lectus sit amet est placerat in. Vel facilisis volutpat est velit. Dolor morbi non arcu risus quis varius quam. Fringilla ut morbi tincidunt augue interdum velit. Tristique senectus et netus et. Viverra tellus in hac habitasse. Ac odio tempor orci dapibus ultrices. Scelerisque purus semper eget duis at tellus at. Id aliquet risus feugiat in ante. In dictum non consectetur a erat nam at lectus. Non diam phasellus vestibulum lorem. Quam vulputate dignissim suspendisse in est. Bibendum enim facilisis gravida neque convallis a cras semper auctor.',
    'Ornare suspendisse sed nisi lacus sed. Etiam non quam lacus suspendisse faucibus interdum posuere lorem. Ornare massa eget egestas purus. Bibendum arcu vitae elementum curabitur vitae. Sed elementum tempus egestas sed sed risus pretium quam vulputate. Feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Nullam eget felis eget nunc lobortis mattis. Lorem dolor sed viverra ipsum. Sed felis eget velit aliquet sagittis id consectetur purus ut. Nam libero justo laoreet sit. Tempor id eu nisl nunc mi ipsum.',
    'Elit pellentesque habitant morbi tristique. Nibh sed pulvinar proin gravida hendrerit lectus a. Netus et malesuada fames ac turpis egestas maecenas pharetra convallis. Enim diam vulputate ut pharetra sit. Gravida quis blandit turpis cursus in. At volutpat diam ut venenatis tellus in metus. Feugiat sed lectus vestibulum mattis ullamcorper. Vel turpis nunc eget lorem dolor sed viverra ipsum. Egestas dui id ornare arcu odio ut sem nulla pharetra. Lorem ipsum dolor sit amet consectetur adipiscing. Nulla malesuada pellentesque elit eget gravida. Ornare arcu dui vivamus arcu felis bibendum ut tristique. Et sollicitudin ac orci phasellus egestas tellus rutrum.',
    'Condimentum mattis pellentesque id nibh tortor. Volutpat commodo sed egestas egestas fringilla phasellus faucibus scelerisque. Aliquam nulla facilisi cras fermentum odio eu feugiat pretium. In hendrerit gravida rutrum quisque non tellus. Nulla porttitor massa id neque. Auctor urna nunc id cursus metus aliquam eleifend mi in. Tempus imperdiet nulla malesuada pellentesque elit eget gravida. Magna etiam tempor orci eu lobortis elementum nibh tellus molestie. Sed vulputate mi sit amet mauris commodo quis imperdiet. Odio ut enim blandit volutpat maecenas. Sit amet mauris commodo quis imperdiet massa tincidunt nunc. Pellentesque diam volutpat commodo sed egestas egestas. Sed turpis tincidunt id aliquet. In arcu cursus euismod quis viverra nibh cras. Purus sit amet luctus venenatis lectus magna fringilla urna porttitor. Duis at consectetur lorem donec massa. Et malesuada fames ac turpis egestas.',
    'Nunc vel risus commodo viverra maecenas accumsan. Vel facilisis volutpat est velit egestas dui id ornare arcu. Sed odio morbi quis commodo odio. Sodales ut etiam sit amet nisl purus in mollis. Sapien nec sagittis aliquam malesuada bibendum. Elit scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus. Malesuada pellentesque elit eget gravida cum sociis natoque. Turpis tincidunt id aliquet risus feugiat in ante. Adipiscing diam donec adipiscing tristique. Fermentum dui faucibus in ornare quam viverra orci sagittis. Id donec ultrices tincidunt arcu non sodales neque sodales. Laoreet suspendisse interdum consectetur libero id faucibus. Nunc eget lorem dolor sed viverra ipsum. Non quam lacus suspendisse faucibus interdum posuere lorem ipsum dolor. Sed risus pretium quam vulputate dignissim suspendisse in est ante. Mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus.',
    'Nullam vehicula ipsum a arcu cursus. Vitae justo eget magna fermentum. Molestie at elementum eu facilisis sed odio morbi quis. Metus dictum at tempor commodo ullamcorper a. Et pharetra pharetra massa massa ultricies. Viverra ipsum nunc aliquet bibendum enim facilisis gravida. Vel fringilla est ullamcorper eget. Mattis vulputate enim nulla aliquet porttitor lacus. Fermentum dui faucibus in ornare quam viverra. Vel turpis nunc eget lorem dolor. Vel facilisis volutpat est velit. Proin libero nunc consequat interdum varius. Id donec ultrices tincidunt arcu non sodales neque. Sed velit dignissim sodales ut eu sem integer vitae justo. Sed adipiscing diam donec adipiscing tristique risus nec feugiat in. Tortor aliquam nulla facilisi cras fermentum odio eu feugiat pretium. Pellentesque sit amet porttitor eget dolor morbi non. Diam ut venenatis tellus in metus vulputate eu. In ornare quam viverra orci sagittis eu.',
    'Dolor magna eget est lorem ipsum dolor sit. In massa tempor nec feugiat nisl pretium fusce. Nunc sed augue lacus viverra vitae congue. Pharetra et ultrices neque ornare aenean euismod elementum nisi. Id diam vel quam elementum pulvinar etiam non quam lacus. Ac tortor vitae purus faucibus ornare suspendisse sed nisi lacus. Aliquam sem et tortor consequat. Bibendum enim facilisis gravida neque convallis a. Vestibulum sed arcu non odio euismod. Vitae aliquet nec ullamcorper sit amet risus. Tortor posuere ac ut consequat semper viverra nam. Pulvinar neque laoreet suspendisse interdum. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas purus. Lorem sed risus ultricies tristique nulla aliquet enim tortor at. Placerat in egestas erat imperdiet sed. Nisi lacus sed viverra tellus in hac. Eu tincidunt tortor aliquam nulla facilisi cras fermentum. Lectus sit amet est placerat in.',
    'Sagittis eu volutpat odio facilisis mauris sit amet massa. Ipsum faucibus vitae aliquet nec ullamcorper sit amet risus. Vitae sapien pellentesque habitant morbi tristique senectus et. Elementum nibh tellus molestie nunc non blandit massa enim nec. Adipiscing tristique risus nec feugiat in fermentum posuere urna nec. Sit amet aliquam id diam maecenas ultricies mi eget mauris. Venenatis cras sed felis eget velit aliquet sagittis. In mollis nunc sed id semper risus in. Est placerat in egestas erat imperdiet sed. Laoreet non curabitur gravida arcu ac tortor. Sodales neque sodales ut etiam sit amet nisl purus in. Enim sit amet venenatis urna cursus eget. Quam nulla porttitor massa id neque aliquam vestibulum. Id faucibus nisl tincidunt eget nullam. Magna fringilla urna porttitor rhoncus dolor purus. Sit amet purus gravida quis blandit turpis cursus. Feugiat in fermentum posuere urna nec tincidunt praesent semper.',
    'Id porta nibh venenatis cras sed. Tristique nulla aliquet enim tortor at auctor urna nunc id. Turpis cursus in hac habitasse platea dictumst quisque sagittis purus. Est ante in nibh mauris cursus mattis molestie. Vulputate odio ut enim blandit volutpat maecenas. Sit amet consectetur adipiscing elit pellentesque. Lobortis scelerisque fermentum dui faucibus in. Massa sed elementum tempus egestas sed sed risus. Lectus urna duis convallis convallis tellus id. Vulputate sapien nec sagittis aliquam malesuada bibendum arcu. Vestibulum morbi blandit cursus risus at ultrices. Massa sapien faucibus et molestie. Vitae justo eget magna fermentum iaculis eu non diam. Pellentesque adipiscing commodo elit at imperdiet dui. Nisi lacus sed viverra tellus in. Quis commodo odio aenean sed adipiscing diam donec adipiscing tristique.',
    'Porttitor eget dolor morbi non arcu risus quis. Vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras tincidunt. Venenatis tellus in metus vulputate eu scelerisque. In tellus integer feugiat scelerisque varius morbi enim nunc. Faucibus nisl tincidunt eget nullam non nisi est sit. Semper auctor neque vitae tempus quam. Est ullamcorper eget nulla facilisi etiam dignissim diam. Urna condimentum mattis pellentesque id nibh. In arcu cursus euismod quis. Quam pellentesque nec nam aliquam sem et. Lacinia quis vel eros donec ac odio. Faucibus turpis in eu mi bibendum neque egestas congue quisque. Vitae tempus quam pellentesque nec nam aliquam sem et tortor. Urna neque viverra justo nec ultrices dui. Quam nulla porttitor massa id neque aliquam vestibulum morbi. Sit amet nisl suscipit adipiscing bibendum est. Augue neque gravida in fermentum et sollicitudin ac. Amet commodo nulla facilisi nullam vehicula ipsum a arcu.',
    'Platea dictumst quisque sagittis purus sit. Porta lorem mollis aliquam ut porttitor leo a diam sollicitudin. Non enim praesent elementum facilisis leo vel. Commodo nulla facilisi nullam vehicula ipsum a arcu cursus. Vulputate sapien nec sagittis aliquam malesuada bibendum. Velit aliquet sagittis id consectetur. Egestas purus viverra accumsan in. Mus mauris vitae ultricies leo integer malesuada nunc vel. Aenean vel elit scelerisque mauris pellentesque. Massa tincidunt dui ut ornare lectus sit amet est placerat. Pellentesque eu tincidunt tortor aliquam. Rutrum tellus pellentesque eu tincidunt tortor aliquam nulla facilisi. Senectus et netus et malesuada fames ac.'
];

function Blindtext(props) {
    const numParagraphs = props.numParagraphs || 1;
    return (
        <div>
            {[...Array(numParagraphs).keys()].map(i => <p key={i}>{paragraphs[i % paragraphs.length]}</p>)}
        </div>
    );
}

export default Blindtext;

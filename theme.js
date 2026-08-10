(function(){
const theme=localStorage.getItem('retro_theme')||'midnight';
document.documentElement.setAttribute('data-theme',theme);

const meta=document.querySelector('meta[name="theme-color"]');

if(meta){
const colors={
midnight:'#08080a',
white:'#f5f5f7',
pink:'#160a12'
};
meta.setAttribute('content',colors[theme]||colors.midnight);
}
})();

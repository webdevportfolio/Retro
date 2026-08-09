(function(){
const savedTheme=localStorage.getItem('retro_theme')||'midnight';
document.documentElement.setAttribute('data-theme',savedTheme);

window.setRetroTheme=function(theme){
if(!['midnight','white','pink'].includes(theme))return;
localStorage.setItem('retro_theme',theme);
document.documentElement.setAttribute('data-theme',theme);
};
})();

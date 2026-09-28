/* OrthoHiB — interactions de la maquette.
   Règle 7 : toutes les fiches et leurs deux volets sont dans la page, le script
   ne fait que basculer des classes. Sélecteurs par classe, jamais par id. */

(function () {
  var points = document.querySelectorAll('.point');
  var fiches = document.querySelectorAll('.fiche');
  var actif = { zone: null, cote: null };

  // cote : "trauma" (point bleu), "maladie" (point corail) ou null (les deux volets)
  function activer(zone, cote) {
    actif = { zone: zone, cote: zone ? cote : null };
    points.forEach(function (p) {
      var ok = p.getAttribute('data-zone') === zone && (!cote || p.getAttribute('data-cote') === cote);
      p.classList.toggle('est-actif', ok);
      p.setAttribute('aria-expanded', ok ? 'true' : 'false');
    });
    fiches.forEach(function (f) {
      var ok = f.getAttribute('data-zone') === zone;
      f.classList.toggle('est-active', ok);
      f.classList.toggle('vue-trauma', ok && cote === 'trauma');
      f.classList.toggle('vue-maladie', ok && cote === 'maladie');
    });
  }

  points.forEach(function (p) {
    p.addEventListener('click', function () {
      var zone = p.getAttribute('data-zone'), cote = p.getAttribute('data-cote');
      if (zone === actif.zone && cote === actif.cote) { activer(null); } else { activer(zone, cote); }
    });
  });

  document.querySelectorAll('.fiche-fermer').forEach(function (b) {
    b.addEventListener('click', function () { activer(null); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && actif.zone) { activer(null); }
  });

  // lien direct depuis une autre page : index.html#zone-genou, #zone-genou-trauma ou #zone-genou-maladie
  var ancre = location.hash.match(/^#zone-([a-z]+)(?:-(trauma|maladie))?$/);
  if (ancre && document.querySelector('.fiche[data-zone="' + ancre[1] + '"]')) { activer(ancre[1], ancre[2] || null); }

  // onglets des secteurs (Traumatologie, Maladies) : tous les panneaux sont dans la page,
  // on ne fait que basculer .est-actif ; l'ancre (#genou) ouvre directement le bon secteur
  var secteurs = document.querySelector('.secteurs');
  if (secteurs) {
    var onglets = secteurs.querySelectorAll('.secteur-onglet');
    var panneaux = secteurs.querySelectorAll('.secteur');
    var afficher = function (id, defiler) {
      var trouve = false;
      panneaux.forEach(function (p) {
        var ok = p.getAttribute('data-secteur') === id;
        p.classList.toggle('est-actif', ok);
        if (ok) { trouve = true; }
      });
      if (!trouve) { return false; }
      onglets.forEach(function (o) {
        var ok = o.getAttribute('data-secteur') === id;
        o.classList.toggle('est-actif', ok);
        if (ok) {
          o.setAttribute('aria-current', 'true');
          // sur mobile, la rangée d'onglets défile : on y amène l'onglet actif
          var rangee = o.parentNode;
          rangee.scrollLeft = o.offsetLeft - rangee.offsetLeft - 16;
        } else { o.removeAttribute('aria-current'); }
      });
      if (defiler) { secteurs.scrollIntoView({ block: 'start' }); }
      return true;
    };
    secteurs.classList.add('avec-onglets');
    onglets.forEach(function (o) {
      o.addEventListener('click', function (e) {
        e.preventDefault();
        var id = o.getAttribute('data-secteur');
        afficher(id, false);
        history.replaceState(null, '', '#' + id);
      });
    });
    var voulu = location.hash.slice(1);
    if (afficher(voulu, true)) {
      // le navigateur saute ensuite sur le panneau (#genou) et cache les onglets : on revient sur les onglets
      window.addEventListener('load', function () { setTimeout(function () { secteurs.scrollIntoView({ block: 'start', behavior: 'auto' }); }, 0); });
    } else if (panneaux.length) {
      afficher(panneaux[0].getAttribute('data-secteur'), false);
    }
    window.addEventListener('hashchange', function () { afficher(location.hash.slice(1), true); });
  }

  // menu mobile
  var entete = document.querySelector('.entete');
  var burger = document.querySelector('.burger');
  if (entete && burger) {
    burger.addEventListener('click', function () {
      var ouvert = entete.classList.toggle('est-ouvert');
      burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    });
  }
})();

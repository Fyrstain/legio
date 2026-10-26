<!-- Attention : Ce fichier est chargé automatiquement à partir du dépôt Template. 
Veuillez ne pas apporter de modifications directement aux projets. 
Pour toute mise à jour, faites les changements sur une branche du projet Template. -->

<!-- L'utilisation de ressources de listes telles que ValueSet, CodeSystem, OperationDefinition permet de mettre en évidence de nouveaux éléments à l'aide du paramètre include. SearchParameter fonctionne également mais ne peut pas être trié par Type et n'a pas d'élément de titre, ce qui nécessite de convertir l'id en titre en utilisant quelque chose comme {%raw%}{{r.id|split "-" | join | capitalize}}{%endraw%} -->

{% assign my_types = "" %}
{%- for r_hash in site.data.resources -%}
  {% assign r_type = r_hash[0] | split: '/' | first %}
  {%- assign r = r_hash[1] -%}
  {%- if r_type == include.type %}
    {% assign my_types =  my_types | append: ","s | append: r.name %}
  {%- endif -%}
{% endfor %}
{% assign my_array = my_types | split: "," %}
{% assign my_array = my_array | sort | uniq %}

<ul>
{% for i in my_array offset:1 %}
  {%- for r_hash in site.data.resources -%}
      {% assign r_type = r_hash[0] | split: '/' | first %}
      {%- assign r = r_hash[1] -%}
      {%- if r.name == i and r_type == include.type %}
        {%- assign new = false -%}
        {%- for new_stuff in site.data.new_stuff -%}
           {%- if new_stuff == i -%}
             {%- assign new = true -%}
             {%- break -%}
           {%- endif -%}
        {%- endfor -%}

        {%- if new -%}
          <li><a href="{{r.path}}"><span class="bg-success" markdown="1">{{r.title}}</span><!-- new-content --></a></li>
        {% else %}
          <li><a href="{{r.path}}">{{r.title}}</a></li>
        {% endif %}

    {% endif %}
  {%- endfor -%}
{% endfor %}
</ul>
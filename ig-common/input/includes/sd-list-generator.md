<!-- Attention : Ce fichier est chargé automatiquement à partir du dépôt Template. 
Veuillez ne pas apporter de modifications directement aux projets. 
Pour toute mise à jour, faites les changements sur une branche du projet Template. -->

{%- for sd_hash in site.data.structuredefinitions -%}
  {%- assign sd1= sd_hash[1] -%}
  {%- unless sd1.type == "Extension" or sd1.kind == "logical" -%}
    {% assign types =  types | append: "," | append: sd1.type %}
  {%- endunless -%}
{% endfor %}
{% assign my_types = types | split: "," %}
{% assign my_types = my_types | sort | uniq %}
{% for i in my_types offset:1 %}
  <h4>{{ i }}</h4>
  <ul>
    {%- for sd_hash in site.data.structuredefinitions -%}
      {%- assign sd1 = sd_hash[1] -%}
      {%- if sd1.type == i %}
        {%- if sd1.kind != "logical" -%}
          {%- assign new = false -%}
          {%- assign parent = false -%}
          {%- assign child = false -%}
          {%- for sd_hash2 in site.data.structuredefinitions -%}
            {%- assign sd2 = sd_hash2[1] -%}
            {% if sd1.basename == sd2.name %}
              {%- assign child = true -%}
              {% break %}
            {% elsif sd1.name == sd2.basename%}
              {%- assign parent = true -%}
              {% break %}
            {% endif %}
          {% endfor %}
          {%- for new_stuff in site.data.new_stuff -%}
            {%- if new_stuff == sd1.name -%}
              {%- assign new = true -%}
              {%- break -%}
            {%- endif -%}
          {%- endfor -%}
            {%- unless parent or child -%}
              {%- if new -%}
                <li><a href="{{sd1.path}}"><span class="bg-success" markdown="1">{{sd1.title}}</span><!-- new-content --></a>{% if sd1.description %}: {{sd1.description}}{% endif %}</li>
              {% else %}
                <li><a href="{{sd1.path}}">{{sd1.title}}</a>{% if sd1.description %}: {{sd1.description}}{% endif %} </li>
              {% endif %}
            {%- endunless -%}
            {%- if parent -%}
              {%- if new -%}
                <li><a href="{{sd1.path}}"><span class="bg-success" markdown="1">{{sd1.title}}</span><!-- new-content --></a>{% if sd1.description %}: {{sd1.description}}{% endif %}
              {% else %}
                <li><a href="{{sd1.path}}">{{sd1.title}}</a>{% if sd1.description %}: {{sd1.description}}{% endif %}
              {% endif %}
                  <ul>
                  {%- for sd_hash3 in site.data.structuredefinitions -%}
                    {%- assign sd3 = sd_hash3[1] -%}
                    {% if sd1.name == sd3.basename %}
                      {%- assign new = false -%}
                      {% for new_stuff in site.data.new_stuff %}
                          {%- if new_stuff == sd3.name -%}
                            {%- assign new = true -%}
                            {%- break -%}
                          {%- endif -%}
                      {%- endfor -%}
                        {%- if new -%}
                          <li><a href="{{sd3.path}}"><span class="bg-success" markdown="1">{{sd3.title}}</span><!-- new-content --></a>{% if sd3.description %}: {{sd3.description}}{% endif %}</li>
                        {% else %}
                          <li><a href="{{sd3.path}}">{{sd3.title}}</a>{% if sd3.description %}: {{sd3.description}}{% endif %}</li>
                        {% endif %}
                    {% endif %}
                  {% endfor %}
                  </ul>
              </li>
          {%- endif -%}
        {% endif %}
      {%- endif -%}
    {%- endfor -%}
  </ul>
{% endfor %}
<project>
  <stage color="#1a1a1a"/>

  <!-- ============================================================
       VARIABLES USED:
       curColor, curTool, brushSize, canvasX, canvasY,
       mouseDown, gridSize, cellSize, paletteIndex,
       drawR, drawG, drawB
  ============================================================ -->

  <!-- ============================================================
       BACKGROUND / STAGE FILL
  ============================================================ -->
  <sprite name="BG" x="0" y="0">
    <costume type="rect" color="#1a1a2e" width="480" height="360"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="looks_gotofrontback">
              <field name="FRONT_BACK">back</field>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- ============================================================
       TOP BAR
  ============================================================ -->
  <sprite name="TopBar" x="0" y="165">
    <costume type="rect" color="#0f0f1a" width="480" height="30"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="looks_gotofrontback">
              <field name="FRONT_BACK">front</field>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- ============================================================
       TITLE LABEL
  ============================================================ -->
  <sprite name="TitleLabel" x="-160" y="165">
    <costume type="rect" color="#00000000" width="1" height="1"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="looks_say">
              <value name="MESSAGE">
                <shadow type="text"><field name="TEXT">🎨 PIXEL EDITOR</field></shadow>
              </value>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- ============================================================
       CANVAS BACKGROUND (checkerboard look via dark rect)
  ============================================================ -->
  <sprite name="CanvasBG" x="30" y="-10">
    <costume type="rect" color="#2a2a3e" width="290" height="290"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="looks_gotofrontback">
              <field name="FRONT_BACK">front</field>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- ============================================================
       CANVAS BORDER
  ============================================================ -->
  <sprite name="CanvasBorder" x="30" y="-10">
    <costume type="rect" color="#ff3c6e" width="294" height="294"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="looks_gotofrontback">
              <field name="FRONT_BACK">front</field>
              <next>
                <!-- Put border behind canvas bg -->
                <block type="looks_gobackwardslayers">
                  <value name="NUM">
                    <shadow type="math_integer"><field name="NUM">1</field></shadow>
                  </value>
                </block>
              </next>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- ============================================================
       PIXEL CELL SPRITE (clone-based 16x16 grid = 256 clones)
       Each clone = one pixel cell on the canvas
       cellSize = 17px, grid starts at top-left (-125, 130) of canvas area
  ============================================================ -->
  <sprite name="PixelCell" x="-200" y="200">
    <costume type="rect" color="#ffffff" width="16" height="16"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">

        <!-- INIT: hide master, spawn 256 clones for 16x16 grid -->
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="data_setvariableto">
              <field name="VARIABLE">gridSize</field>
              <value name="VALUE"><shadow type="math_number"><field name="NUM">16</field></shadow></value>
              <next>
                <block type="data_setvariableto">
                  <field name="VARIABLE">cellSize</field>
                  <value name="VALUE"><shadow type="math_number"><field name="NUM">17</field></shadow></value>
                  <next>
                    <block type="data_setvariableto">
                      <field name="VARIABLE">curColor</field>
                      <value name="VALUE"><shadow type="text"><field name="TEXT">#FF0000</field></shadow></value>
                      <next>
                        <block type="data_setvariableto">
                          <field name="VARIABLE">curTool</field>
                          <value name="VALUE"><shadow type="text"><field name="TEXT">draw</field></shadow></value>
                          <next>
                            <block type="data_setvariableto">
                              <field name="VARIABLE">brushSize</field>
                              <value name="VALUE"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
                              <next>
                                <block type="data_setvariableto">
                                  <field name="VARIABLE">drawR</field>
                                  <value name="VALUE"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
                                  <next>
                                    <block type="data_setvariableto">
                                      <field name="VARIABLE">drawG</field>
                                      <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                                      <next>
                                        <block type="data_setvariableto">
                                          <field name="VARIABLE">drawB</field>
                                          <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                                          <next>
                                            <block type="looks_hide">
                                              <next>
                                                <!-- Spawn 16 rows -->
                                                <block type="data_setvariableto">
                                                  <field name="VARIABLE">canvasY</field>
                                                  <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                                                  <next>
                                                    <block type="control_repeat">
                                                      <value name="TIMES">
                                                        <shadow type="math_whole_number"><field name="NUM">16</field></shadow>
                                                      </value>
                                                      <statement name="SUBSTACK">
                                                        <block type="data_setvariableto">
                                                          <field name="VARIABLE">canvasX</field>
                                                          <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                                                          <next>
                                                            <block type="control_repeat">
                                                              <value name="TIMES">
                                                                <shadow type="math_whole_number"><field name="NUM">16</field></shadow>
                                                              </value>
                                                              <statement name="SUBSTACK">
                                                                <block type="control_create_clone_of">
                                                                  <value name="CLONE_OPTION">
                                                                    <shadow type="control_create_clone_of_menu"><field name="CLONE_OPTION">_myself_</field></shadow>
                                                                  </value>
                                                                  <next>
                                                                    <block type="data_changevariableby">
                                                                      <field name="VARIABLE">canvasX</field>
                                                                      <value name="VALUE"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
                                                                    </block>
                                                                  </next>
                                                                </block>
                                                              </statement>
                                                            </block>
                                                          </next>
                                                        </block>
                                                      </statement>
                                                      <next>
                                                        <block type="data_changevariableby">
                                                          <field name="VARIABLE">canvasY</field>
                                                          <value name="VALUE"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
                                                        </block>
                                                      </next>
                                                    </block>
                                                  </next>
                                                </block>
                                              </next>
                                            </block>
                                          </next>
                                        </block>
                                      </next>
                                    </block>
                                  </next>
                                </block>
                              </next>
                            </block>
                          </next>
                        </block>
                      </next>
                    </block>
                  </next>
                </block>
              </next>
            </block>
          </next>
        </block>

        <!-- CLONE START: position each cell, store its grid coords -->
        <block type="event_whenthisspritecloned" x="20" y="600">
          <next>
            <!-- Each clone stores its own gridX, gridY using "my" variables via attributes -->
            <!-- We place clone at canvas origin (-125, 128) + (col*17, -row*17) -->
            <!-- Canvas top-left in stage coords: x=-124, y=128 -->
            <block type="motion_setx">
              <value name="X">
                <block type="operator_add">
                  <value name="NUM1">
                    <shadow type="math_number"><field name="NUM">-124</field></shadow>
                  </value>
                  <value name="NUM2">
                    <block type="operator_multiply">
                      <value name="NUM1">
                        <block type="data_variable"><field name="VARIABLE">canvasX</field></block>
                      </value>
                      <value name="NUM2">
                        <shadow type="math_number"><field name="NUM">17</field></shadow>
                      </value>
                    </block>
                  </value>
                </block>
              </value>
              <next>
                <block type="motion_sety">
                  <value name="Y">
                    <block type="operator_subtract">
                      <value name="NUM1">
                        <shadow type="math_number"><field name="NUM">128</field></shadow>
                      </value>
                      <value name="NUM2">
                        <block type="operator_multiply">
                          <value name="NUM1">
                            <block type="data_variable"><field name="VARIABLE">canvasY</field></block>
                          </value>
                          <value name="NUM2">
                            <shadow type="math_number"><field name="NUM">17</field></shadow>
                          </value>
                        </block>
                      </value>
                    </block>
                  </value>
                  <next>
                    <!-- Start as transparent (empty pixel) -->
                    <block type="looks_setghosteffectto">
                      <value name="EFFECT"><shadow type="math_number"><field name="NUM">100</field></shadow></value>
                      <next>
                        <block type="looks_show">
                          <next>
                            <!-- Draw loop: check if mouse overlaps this cell -->
                            <block type="control_forever">
                              <statement name="SUBSTACK">
                                <block type="control_if">
                                  <value name="CONDITION">
                                    <block type="operator_and">
                                      <value name="OPERAND1">
                                        <block type="sensing_mousedown"/>
                                      </value>
                                      <value name="OPERAND2">
                                        <block type="sensing_touchingobject">
                                          <value name="TOUCHINGOBJECTMENU">
                                            <shadow type="sensing_touchingobjectmenu"><field name="TOUCHING">_mouse_</field></shadow>
                                          </value>
                                        </block>
                                      </value>
                                    </block>
                                  </value>
                                  <statement name="SUBSTACK">
                                    <!-- Check tool -->
                                    <block type="control_if">
                                      <value name="CONDITION">
                                        <block type="operator_equals">
                                          <value name="OPERAND1"><block type="data_variable"><field name="VARIABLE">curTool</field></block></value>
                                          <value name="OPERAND2"><shadow type="text"><field name="TEXT">draw</field></shadow></value>
                                        </block>
                                      </value>
                                      <statement name="SUBSTACK">
                                        <!-- Paint: set color, remove ghost -->
                                        <block type="looks_setcoloreffectto">
                                          <value name="EFFECT">
                                            <block type="data_variable"><field name="VARIABLE">drawR</field></block>
                                          </value>
                                          <next>
                                            <block type="looks_setghosteffectto">
                                              <value name="EFFECT"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                                            </block>
                                          </next>
                                        </block>
                                      </statement>
                                      <next>
                                        <block type="control_if">
                                          <value name="CONDITION">
                                            <block type="operator_equals">
                                              <value name="OPERAND1"><block type="data_variable"><field name="VARIABLE">curTool</field></block></value>
                                              <value name="OPERAND2"><shadow type="text"><field name="TEXT">erase</field></shadow></value>
                                            </block>
                                          </value>
                                          <statement name="SUBSTACK">
                                            <!-- Erase: make ghost again -->
                                            <block type="looks_setghosteffectto">
                                              <value name="EFFECT"><shadow type="math_number"><field name="NUM">100</field></shadow></value>
                                            </block>
                                          </statement>
                                        </block>
                                      </next>
                                    </block>
                                  </statement>
                                </block>
                              </statement>
                            </block>
                          </next>
                        </block>
                      </next>
                    </block>
                  </next>
                </block>
              </next>
            </block>
          </next>
        </block>

      </xml>
    </blocks>
  </sprite>

  <!-- ============================================================
       LEFT PANEL BACKGROUND
  ============================================================ -->
  <sprite name="LeftPanelBG" x="-195" y="-10">
    <costume type="rect" color="#0f0f1a" width="86" height="290"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="looks_gotofrontback">
              <field name="FRONT_BACK">front</field>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- ============================================================
       TOOL: DRAW BUTTON
  ============================================================ -->
  <sprite name="BtnDraw" x="-195" y="110">
    <costume type="rect" color="#ff3c6e" width="70" height="28"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">

        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="looks_say">
              <value name="MESSAGE"><shadow type="text"><field name="TEXT">✏️ DRAW</field></shadow></value>
            </block>
          </next>
        </block>

        <block type="event_whenflagclicked" x="200" y="20">
          <next>
            <block type="control_forever">
              <statement name="SUBSTACK">
                <block type="control_if">
                  <value name="CONDITION">
                    <block type="operator_and">
                      <value name="OPERAND1"><block type="sensing_mousedown"/></value>
                      <value name="OPERAND2">
                        <block type="sensing_touchingobject">
                          <value name="TOUCHINGOBJECTMENU">
                            <shadow type="sensing_touchingobjectmenu"><field name="TOUCHING">_mouse_</field></shadow>
                          </value>
                        </block>
                      </value>
                    </block>
                  </value>
                  <statement name="SUBSTACK">
                    <block type="data_setvariableto">
                      <field name="VARIABLE">curTool</field>
                      <value name="VALUE"><shadow type="text"><field name="TEXT">draw</field></shadow></value>
                      <next>
                        <block type="looks_setcoloreffectto">
                          <value name="EFFECT"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                          <next>
                            <block type="control_wait">
                              <value name="DURATION"><shadow type="math_positive_number"><field name="NUM">0.2</field></shadow></value>
                            </block>
                          </next>
                        </block>
                      </next>
                    </block>
                  </statement>
                </block>
              </statement>
            </block>
          </next>
        </block>

      </xml>
    </blocks>
  </sprite>

  <!-- ============================================================
       TOOL: ERASE BUTTON
  ============================================================ -->
  <sprite name="BtnErase" x="-195" y="75">
    <costume type="rect" color="#334" width="70" height="28"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">

        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="looks_say">
              <value name="MESSAGE"><shadow type="text"><field name="TEXT">🧹 ERASE</field></shadow></value>
            </block>
          </next>
        </block>

        <block type="event_whenflagclicked" x="200" y="20">
          <next>
            <block type="control_forever">
              <statement name="SUBSTACK">
                <block type="control_if">
                  <value name="CONDITION">
                    <block type="operator_and">
                      <value name="OPERAND1"><block type="sensing_mousedown"/></value>
                      <value name="OPERAND2">
                        <block type="sensing_touchingobject">
                          <value name="TOUCHINGOBJECTMENU">
                            <shadow type="sensing_touchingobjectmenu"><field name="TOUCHING">_mouse_</field></shadow>
                          </value>
                        </block>
                      </value>
                    </block>
                  </value>
                  <statement name="SUBSTACK">
                    <block type="data_setvariableto">
                      <field name="VARIABLE">curTool</field>
                      <value name="VALUE"><shadow type="text"><field name="TEXT">erase</field></shadow></value>
                      <next>
                        <block type="control_wait">
                          <value name="DURATION"><shadow type="math_positive_number"><field name="NUM">0.2</field></shadow></value>
                        </block>
                      </next>
                    </block>
                  </statement>
                </block>
              </statement>
            </block>
          </next>
        </block>

      </xml>
    </blocks>
  </sprite>

  <!-- ============================================================
       TOOL: CLEAR BUTTON
  ============================================================ -->
  <sprite name="BtnClear" x="-195" y="40">
    <costume type="rect" color="#aa1133" width="70" height="28"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">

        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="looks_say">
              <value name="MESSAGE"><shadow type="text"><field name="TEXT">✕ CLEAR</field></shadow></value>
            </block>
          </next>
        </block>

        <block type="event_whenflagclicked" x="200" y="20">
          <next>
            <block type="control_forever">
              <statement name="SUBSTACK">
                <block type="control_if">
                  <value name="CONDITION">
                    <block type="operator_and">
                      <value name="OPERAND1"><block type="sensing_mousedown"/></value>
                      <value name="OPERAND2">
                        <block type="sensing_touchingobject">
                          <value name="TOUCHINGOBJECTMENU">
                            <shadow type="sensing_touchingobjectmenu"><field name="TOUCHING">_mouse_</field></shadow>
                          </value>
                        </block>
                      </value>
                    </block>
                  </value>
                  <statement name="SUBSTACK">
                    <block type="event_broadcast">
                      <value name="BROADCAST_INPUT">
                        <shadow type="event_broadcast_menu"><field name="BROADCAST_OPTION">clearAll</field></shadow>
                      </value>
                      <next>
                        <block type="control_wait">
                          <value name="DURATION"><shadow type="math_positive_number"><field name="NUM">0.3</field></shadow></value>
                        </block>
                      </next>
                    </block>
                  </statement>
                </block>
              </statement>
            </block>
          </next>
        </block>

      </xml>
    </blocks>
  </sprite>

  <!-- ============================================================
       CLEAR ALL HANDLER (on PixelCell clones via broadcast)
       We add a second whenbroadcastreceived to PixelCell's blocks
       by adding another sprite that uses a pen trick — actually
       we'll handle clearAll inside PixelCell logic via a separate
       broadcast listener block defined here:
  ============================================================ -->
  <sprite name="ClearHandler" x="-200" y="200">
    <costume type="rect" color="#00000000" width="1" height="1"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <!-- This just re-broadcasts as a tool switch then back -->
        <block type="event_whenbroadcastreceived" x="20" y="20">
          <field name="BROADCAST_OPTION">clearAll</field>
          <next>
            <!-- Temporarily set tool to erase-all signal -->
            <block type="data_setvariableto">
              <field name="VARIABLE">curTool</field>
              <value name="VALUE"><shadow type="text"><field name="TEXT">clearall</field></shadow></value>
              <next>
                <block type="control_wait">
                  <value name="DURATION"><shadow type="math_positive_number"><field name="NUM">0.05</field></shadow></value>
                  <next>
                    <block type="data_setvariableto">
                      <field name="VARIABLE">curTool</field>
                      <value name="VALUE"><shadow type="text"><field name="TEXT">draw</field></shadow></value>
                    </block>
                  </next>
                </block>
              </next>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- ============================================================
       PALETTE PANEL BACKGROUND
  ============================================================ -->
  <sprite name="PalettePanelBG" x="-195" y="-80">
    <costume type="rect" color="#161625" width="86" height="120"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="looks_say">
              <value name="MESSAGE"><shadow type="text"><field name="TEXT">COLORS</field></shadow></value>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- ============================================================
       COLOR SWATCHES — Row 1
       Each swatch sets drawR, drawG, drawB and curColor
  ============================================================ -->

  <!-- RED -->
  <sprite name="SwatchRed" x="-218" y="-50">
    <costume type="rect" color="#FF0000" width="18" height="18"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="control_forever">
              <statement name="SUBSTACK">
                <block type="control_if">
                  <value name="CONDITION">
                    <block type="operator_and">
                      <value name="OPERAND1"><block type="sensing_mousedown"/></value>
                      <value name="OPERAND2">
                        <block type="sensing_touchingobject">
                          <value name="TOUCHINGOBJECTMENU">
                            <shadow type="sensing_touchingobjectmenu"><field name="TOUCHING">_mouse_</field></shadow>
                          </value>
                        </block>
                      </value>
                    </block>
                  </value>
                  <statement name="SUBSTACK">
                    <block type="data_setvariableto">
                      <field name="VARIABLE">drawR</field>
                      <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                      <next>
                        <block type="data_setvariableto">
                          <field name="VARIABLE">drawG</field>
                          <value name="VALUE"><shadow type="math_number"><field name="NUM">-100</field></shadow></value>
                          <next>
                            <block type="data_setvariableto">
                              <field name="VARIABLE">drawB</field>
                              <value name="VALUE"><shadow type="math_number"><field name="NUM">-100</field></shadow></value>
                              <next>
                                <block type="control_wait">
                                  <value name="DURATION"><shadow type="math_positive_number"><field name="NUM">0.15</field></shadow></value>
                                </block>
                              </next>
                            </block>
                          </next>
                        </block>
                      </next>
                    </block>
                  </statement>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- GREEN -->
  <sprite name="SwatchGreen" x="-196" y="-50">
    <costume type="rect" color="#00FF00" width="18" height="18"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="control_forever">
              <statement name="SUBSTACK">
                <block type="control_if">
                  <value name="CONDITION">
                    <block type="operator_and">
                      <value name="OPERAND1"><block type="sensing_mousedown"/></value>
                      <value name="OPERAND2">
                        <block type="sensing_touchingobject">
                          <value name="TOUCHINGOBJECTMENU">
                            <shadow type="sensing_touchingobjectmenu"><field name="TOUCHING">_mouse_</field></shadow>
                          </value>
                        </block>
                      </value>
                    </block>
                  </value>
                  <statement name="SUBSTACK">
                    <block type="data_setvariableto">
                      <field name="VARIABLE">drawR</field>
                      <value name="VALUE"><shadow type="math_number"><field name="NUM">-100</field></shadow></value>
                      <next>
                        <block type="data_setvariableto">
                          <field name="VARIABLE">drawG</field>
                          <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                          <next>
                            <block type="data_setvariableto">
                              <field name="VARIABLE">drawB</field>
                              <value name="VALUE"><shadow type="math_number"><field name="NUM">-100</field></shadow></value>
                              <next>
                                <block type="control_wait">
                                  <value name="DURATION"><shadow type="math_positive_number"><field name="NUM">0.15</field></shadow></value>
                                </block>
                              </next>
                            </block>
                          </next>
                        </block>
                      </next>
                    </block>
                  </statement>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- BLUE -->
  <sprite name="SwatchBlue" x="-174" y="-50">
    <costume type="rect" color="#0000FF" width="18" height="18"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="control_forever">
              <statement name="SUBSTACK">
                <block type="control_if">
                  <value name="CONDITION">
                    <block type="operator_and">
                      <value name="OPERAND1"><block type="sensing_mousedown"/></value>
                      <value name="OPERAND2">
                        <block type="sensing_touchingobject">
                          <value name="TOUCHINGOBJECTMENU">
                            <shadow type="sensing_touchingobjectmenu"><field name="TOUCHING">_mouse_</field></shadow>
                          </value>
                        </block>
                      </value>
                    </block>
                  </value>
                  <statement name="SUBSTACK">
                    <block type="data_setvariableto">
                      <field name="VARIABLE">drawR</field>
                      <value name="VALUE"><shadow type="math_number"><field name="NUM">-100</field></shadow></value>
                      <next>
                        <block type="data_setvariableto">
                          <field name="VARIABLE">drawG</field>
                          <value name="VALUE"><shadow type="math_number"><field name="NUM">-100</field></shadow></value>
                          <next>
                            <block type="data_setvariableto">
                              <field name="VARIABLE">drawB</field>
                              <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                              <next>
                                <block type="control_wait">
                                  <value name="DURATION"><shadow type="math_positive_number"><field name="NUM">0.15</field></shadow></value>
                                </block>
                              </next>
                            </block>
                          </next>
                        </block>
                      </next>
                    </block>
                  </statement>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- YELLOW -->
  <sprite name="SwatchYellow" x="-218" y="-72">
    <costume type="rect" color="#FFFF00" width="18" height="18"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="control_forever">
              <statement name="SUBSTACK">
                <block type="control_if">
                  <value name="CONDITION">
                    <block type="operator_and">
                      <value name="OPERAND1"><block type="sensing_mousedown"/></value>
                      <value name="OPERAND2">
                        <block type="sensing_touchingobject">
                          <value name="TOUCHINGOBJECTMENU">
                            <shadow type="sensing_touchingobjectmenu"><field name="TOUCHING">_mouse_</field></shadow>
                          </value>
                        </block>
                      </value>
                    </block>
                  </value>
                  <statement name="SUBSTACK">
                    <block type="data_setvariableto">
                      <field name="VARIABLE">drawR</field>
                      <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                      <next>
                        <block type="data_setvariableto">
                          <field name="VARIABLE">drawG</field>
                          <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                          <next>
                            <block type="data_setvariableto">
                              <field name="VARIABLE">drawB</field>
                              <value name="VALUE"><shadow type="math_number"><field name="NUM">-100</field></shadow></value>
                              <next>
                                <block type="control_wait">
                                  <value name="DURATION"><shadow type="math_positive_number"><field name="NUM">0.15</field></shadow></value>
                                </block>
                              </next>
                            </block>
                          </next>
                        </block>
                      </next>
                    </block>
                  </statement>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- CYAN -->
  <sprite name="SwatchCyan" x="-196" y="-72">
    <costume type="rect" color="#00FFFF" width="18" height="18"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="control_forever">
              <statement name="SUBSTACK">
                <block type="control_if">
                  <value name="CONDITION">
                    <block type="operator_and">
                      <value name="OPERAND1"><block type="sensing_mousedown"/></value>
                      <value name="OPERAND2">
                        <block type="sensing_touchingobject">
                          <value name="TOUCHINGOBJECTMENU">
                            <shadow type="sensing_touchingobjectmenu"><field name="TOUCHING">_mouse_</field></shadow>
                          </value>
                        </block>
                      </value>
                    </block>
                  </value>
                  <statement name="SUBSTACK">
                    <block type="data_setvariableto">
                      <field name="VARIABLE">drawR</field>
                      <value name="VALUE"><shadow type="math_number"><field name="NUM">-100</field></shadow></value>
                      <next>
                        <block type="data_setvariableto">
                          <field name="VARIABLE">drawG</field>
                          <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                          <next>
                            <block type="data_setvariableto">
                              <field name="VARIABLE">drawB</field>
                              <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                              <next>
                                <block type="control_wait">
                                  <value name="DURATION"><shadow type="math_positive_number"><field name="NUM">0.15</field></shadow></value>
                                </block>
                              </next>
                            </block>
                          </next>
                        </block>
                      </next>
                    </block>
                  </statement>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- MAGENTA -->
  <sprite name="SwatchMagenta" x="-174" y="-72">
    <costume type="rect" color="#FF00FF" width="18" height="18"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="control_forever">
              <statement name="SUBSTACK">
                <block type="control_if">
                  <value name="CONDITION">
                    <block type="operator_and">
                      <value name="OPERAND1"><block type="sensing_mousedown"/></value>
                      <value name="OPERAND2">
                        <block type="sensing_touchingobject">
                          <value name="TOUCHINGOBJECTMENU">
                            <shadow type="sensing_touchingobjectmenu"><field name="TOUCHING">_mouse_</field></shadow>
                          </value>
                        </block>
                      </value>
                    </block>
                  </value>
                  <statement name="SUBSTACK">
                    <block type="data_setvariableto">
                      <field name="VARIABLE">drawR</field>
                      <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                      <next>
                        <block type="data_setvariableto">
                          <field name="VARIABLE">drawG</field>
                          <value name="VALUE"><shadow type="math_number"><field name="NUM">-100</field></shadow></value>
                          <next>
                            <block type="data_setvariableto">
                              <field name="VARIABLE">drawB</field>
                              <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                              <next>
                                <block type="control_wait">
                                  <value name="DURATION"><shadow type="math_positive_number"><field name="NUM">0.15</field></shadow></value>
                                </block>
                              </next>
                            </block>
                          </next>
                        </block>
                      </next>
                    </block>
                  </statement>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- WHITE -->
  <sprite name="SwatchWhite" x="-218" y="-94">
    <costume type="rect" color="#FFFFFF" width="18" height="18"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="control_forever">
              <statement name="SUBSTACK">
                <block type="control_if">
                  <value name="CONDITION">
                    <block type="operator_and">
                      <value name="OPERAND1"><block type="sensing_mousedown"/></value>
                      <value name="OPERAND2">
                        <block type="sensing_touchingobject">
                          <value name="TOUCHINGOBJECTMENU">
                            <shadow type="sensing_touchingobjectmenu"><field name="TOUCHING">_mouse_</field></shadow>
                          </value>
                        </block>
                      </value>
                    </block>
                  </value>
                  <statement name="SUBSTACK">
                    <block type="data_setvariableto">
                      <field name="VARIABLE">drawR</field>
                      <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                      <next>
                        <block type="data_setvariableto">
                          <field name="VARIABLE">drawG</field>
                          <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                          <next>
                            <block type="data_setvariableto">
                              <field name="VARIABLE">drawB</field>
                              <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                              <next>
                                <block type="control_wait">
                                  <value name="DURATION"><shadow type="math_positive_number"><field name="NUM">0.15</field></shadow></value>
                                </block>
                              </next>
                            </block>
                          </next>
                        </block>
                      </next>
                    </block>
                  </statement>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- BLACK -->
  <sprite name="SwatchBlack" x="-196" y="-94">
    <costume type="rect" color="#111111" width="18" height="18"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="control_forever">
              <statement name="SUBSTACK">
                <block type="control_if">
                  <value name="CONDITION">
                    <block type="operator_and">
                      <value name="OPERAND1"><block type="sensing_mousedown"/></value>
                      <value name="OPERAND2">
                        <block type="sensing_touchingobject">
                          <value name="TOUCHINGOBJECTMENU">
                            <shadow type="sensing_touchingobjectmenu"><field name="TOUCHING">_mouse_</field></shadow>
                          </value>
                        </block>
                      </value>
                    </block>
                  </value>
                  <statement name="SUBSTACK">
                    <block type="data_setvariableto">
                      <field name="VARIABLE">drawR</field>
                      <value name="VALUE"><shadow type="math_number"><field name="NUM">-100</field></shadow></value>
                      <next>
                        <block type="data_setvariableto">
                          <field name="VARIABLE">drawG</field>
                          <value name="VALUE"><shadow type="math_number"><field name="NUM">-100</field></shadow></value>
                          <next>
                            <block type="data_setvariableto">
                              <field name="VARIABLE">drawB</field>
                              <value name="VALUE"><shadow type="math_number"><field name="NUM">-100</field></shadow></value>
                              <next>
                                <block type="control_wait">
                                  <value name="DURATION"><shadow type="math_positive_number"><field name="NUM">0.15</field></shadow></value>
                                </block>
                              </next>
                            </block>
                          </next>
                        </block>
                      </next>
                    </block>
                  </statement>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- ORANGE -->
  <sprite name="SwatchOrange" x="-174" y="-94">
    <costume type="rect" color="#FF8800" width="18" height="18"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="control_forever">
              <statement name="SUBSTACK">
                <block type="control_if">
                  <value name="CONDITION">
                    <block type="operator_and">
                      <value name="OPERAND1"><block type="sensing_mousedown"/></value>
                      <value name="OPERAND2">
                        <block type="sensing_touchingobject">
                          <value name="TOUCHINGOBJECTMENU">
                            <shadow type="sensing_touchingobjectmenu"><field name="TOUCHING">_mouse_</field></shadow>
                          </value>
                        </block>
                      </value>
                    </block>
                  </value>
                  <statement name="SUBSTACK">
                    <block type="data_setvariableto">
                      <field name="VARIABLE">drawR</field>
                      <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                      <next>
                        <block type="data_setvariableto">
                          <field name="VARIABLE">drawG</field>
                          <value name="VALUE"><shadow type="math_number"><field name="NUM">-47</field></shadow></value>
                          <next>
                            <block type="data_setvariableto">
                              <field name="VARIABLE">drawB</field>
                              <value name="VALUE"><shadow type="math_number"><field name="NUM">-100</field></shadow></value>
                              <next>
                                <block type="control_wait">
                                  <value name="DURATION"><shadow type="math_positive_number"><field name="NUM">0.15</field></shadow></value>
                                </block>
                              </next>
                            </block>
                          </next>
                        </block>
                      </next>
                    </block>
                  </statement>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- ============================================================
       ACTIVE COLOR PREVIEW
  ============================================================ -->
  <sprite name="ActiveColorPreview" x="-195" y="-130">
    <costume type="rect" color="#ffffff" width="70" height="28"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="looks_say">
              <value name="MESSAGE"><shadow type="text"><field name="TEXT">COLOR ↑</field></shadow></value>
            </block>
          </next>
        </block>
        <!-- Continuously match color effect to drawR for preview hue -->
        <block type="event_whenflagclicked" x="200" y="20">
          <next>
            <block type="control_forever">
              <statement name="SUBSTACK">
                <block type="looks_setcoloreffectto">
                  <value name="EFFECT">
                    <block type="data_variable"><field name="VARIABLE">drawR</field></block>
                  </value>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- ============================================================
       STATUS / TOOL DISPLAY
  ============================================================ -->
  <sprite name="StatusDisplay" x="160" y="155">
    <costume type="rect" color="#00000000" width="1" height="1"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="control_forever">
              <statement name="SUBSTACK">
                <block type="looks_say">
                  <value name="MESSAGE">
                    <block type="operator_join">
                      <value name="STRING1">
                        <shadow type="text"><field name="TEXT">TOOL: </field></shadow>
                      </value>
                      <value name="STRING2">
                        <block type="data_variable"><field name="VARIABLE">curTool</field></block>
                      </value>
                    </block>
                  </value>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

  <!-- ============================================================
       INSTRUCTIONS
  ============================================================ -->
  <sprite name="Instructions" x="150" y="-130">
    <costume type="rect" color="#00000000" width="1" height="1"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="20" y="20">
          <next>
            <block type="looks_say">
              <value name="MESSAGE">
                <shadow type="text"><field name="TEXT">Click canvas to draw!</field></shadow>
              </value>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>

</project>

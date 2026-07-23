"""Extract hero talent data from Dota 2 game VPK files (authoritative source)."""

import json, os, re, sys
from collections import OrderedDict

DOTA_VPK = r'C:\Program Files (x86)\Steam\steamapps\common\dota 2 beta\game\dota\pak01_dir.vpk'
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TALENT_LEVELS = {10: 10, 11: 10, 12: 15, 13: 15, 14: 20, 15: 20, 16: 25, 17: 25}
OLD_INTERNAL_NAMES = {
    'windrunner': 21, 'zuus': 22, 'necrolyte': 36, 'magnataur': 53,
    'nevermore': 39, 'obsidian_destroyer': 71, 'shredder': 87,
    'rattletrap': 26, 'wisp': 94, 'skeleton_king': 57, 'life_stealer': 54,
    'antimage': 1, 'axe': 2, 'bane': 3, 'bloodseeker': 4, 'crystal_maiden': 5,
    'drow_ranger': 6, 'earthshaker': 7, 'juggernaut': 8, 'mirana': 9,
    'nevermore': 10, 'morphling': 11, 'phantom_lancer': 12, 'puck': 13,
    'pudge': 14, 'razor': 15, 'sand_king': 16, 'storm_spirit': 17,
    'sven': 18, 'tiny': 19, 'vengefulspirit': 20, 'windrunner': 21,
    'zuus': 22, 'kunkka': 23, 'lina': 25, 'rattletrap': 26, 'lion': 27,
}
HID_TO_LEGACY = {v: k for k, v in OLD_INTERNAL_NAMES.items()}

try:
    import vpk
except ImportError:
    print("ERROR: requires 'vpk' Python package. Install: pip install vpk", file=sys.stderr)
    sys.exit(1)


def read_vpk_text(path):
    import vpk as _vpk
    vp = _vpk.open(DOTA_VPK)
    raw = vp[path].read()
    return raw.decode('utf-8', errors='replace')


def parse_kv_sections(text, start_idx=0):
    """Parse KV blocks at a given nesting level: key { ... }. Returns OrderedDict."""
    import re
    sections = OrderedDict()
    # Find all quoted keys followed by {
    pattern = re.compile(r'"(?:[^"\\]|\\.)*"\s*\{')
    for m in pattern.finditer(text, start_idx):
        key = m.group()[1:m.group().rindex('"')]
        start = m.end()
        depth = 1
        i = start
        while depth > 0 and i < len(text):
            if text[i] == '{': depth += 1
            elif text[i] == '}': depth -= 1
            i += 1
        sections[key] = text[start:i - 1]
    return sections


def parse_kv_to_dict(block_text):
    """Parse a KV block into a flat dict (simple key-value pairs)."""
    result = {}
    i = 0
    while i < len(block_text):
        while i < len(block_text) and block_text[i] in ' \t\r\n':
            i += 1
        if i >= len(block_text) or block_text[i] != '"':
            i += 1
            continue
        end = block_text.index('"', i + 1)
        key = block_text[i + 1:end]
        i = end + 1
        while i < len(block_text) and block_text[i] in ' \t\r\n':
            i += 1
        if i >= len(block_text):
            break
        if block_text[i] == '{':
            depth = 1
            i += 1
            while depth > 0 and i < len(block_text):
                if block_text[i] == '{': depth += 1
                elif block_text[i] == '}': depth -= 1
                i += 1
        elif block_text[i] == '"':
            end2 = block_text.index('"', i + 1)
            val = block_text[i + 1:end2]
            result[key] = val
            i = end2 + 1
        else:
            i += 1
    return result


def build_ability_id_map():
    """Build ability internal name -> numeric ID map from npc_ability_ids.txt."""
    txt = read_vpk_text('scripts/npc/npc_ability_ids.txt')
    id_map = {}
    import re
    for line in txt.splitlines():
        line = line.strip()
        m = re.match(r'"([^"]+)"\s+"(\d+)"', line)
        if m:
            id_map[m.group(1)] = int(m.group(2))
    return id_map


def build_localization_map():
    """Build ability name -> display name map from abilities_english.txt."""
    txt = read_vpk_text('resource/localization/abilities_english.txt')
    dn_map = {}

    def extract_kv(line):
        """Extract key-value from a quoted line."""
        parts = line.split('"')
        if len(parts) >= 4:
            return parts[1].strip(), parts[3].strip()
        return None, None

    for line in txt.splitlines():
        line = line.rstrip()
        if not line or line.startswith('//'):
            continue

        key, val = extract_kv(line)
        if key is None or not val:
            continue

        # Description/Lore lines (case-insensitive)
        if key.lower().endswith('_description') or key.lower().endswith('_lore'):
            continue

        tooltip_prefixes = ['DOTA_Tooltip_ability_', 'DOTA_Tooltip_Ability_']
        matched_prefix = None
        for p in tooltip_prefixes:
            if key.startswith(p):
                matched_prefix = p
                break

        if matched_prefix:
            abil_name = key[len(matched_prefix):]
            if abil_name not in dn_map:
                dn_map[abil_name] = val
        elif not key.startswith('DOTA_Tooltip_') and not key.startswith('DOTA_Tooltip_'):
            # Bare ability key
            dn_map[key] = val

    return dn_map


def build_ability_id_from_npc_abilities():
    """Also get ability name -> ID from npc_abilities.txt for completeness."""
    txt = read_vpk_text('scripts/npc/npc_abilities.txt')
    id_map = {}
    sections = parse_kv_sections(txt)
    for name, block in sections.items():
        if name in ('Version',): continue
        d = parse_kv_to_dict(block)
        if 'ID' in d:
            try:
                id_map[name] = int(d['ID'])
            except ValueError:
                pass
    return id_map


def extract_hero_talents():
    """Extract hero talent slot assignments from npc_heroes.txt."""
    txt = read_vpk_text('scripts/npc/npc_heroes.txt')
    ability_ids = build_ability_id_map()
    loc_map = build_localization_map()

    # Find the DOTAHeroes root block
    root_idx = txt.find('"DOTAHeroes"')
    if root_idx < 0:
        print('ERROR: DOTAHeroes section not found', file=sys.stderr)
        return [], ability_ids, loc_map
    root_sections = parse_kv_sections(txt, root_idx)
    root_content = root_sections.get('DOTAHeroes', txt)
    if root_content == txt:
        print('ERROR: could not parse DOTAHeroes block', file=sys.stderr)
        return [], ability_ids, loc_map

    sections = parse_kv_sections(root_content)
    heroes = []

    for name, block in sections.items():
        if not name.startswith('npc_dota_hero_'):
            continue
        # Skip persona, base, variants
        if 'persona' in name or name == 'npc_dota_hero_base':
            continue

        d = parse_kv_to_dict(block)

        # Must have HeroID and be enabled
        if 'HeroID' not in d:
            continue
        try:
            hid = int(d['HeroID'])
        except ValueError:
            continue

        # Determine display name from hero key
        hero_key = name.replace('npc_dota_hero_', '')
        display_name = d.get('workshop_guide_name', '')
        if not display_name:
            display_name = hero_key.replace('_', ' ').title()

        # Determine talent slot range
        talent_start_str = d.get('AbilityTalentStart', '')
        try:
            talent_start = int(talent_start_str)
        except (ValueError, TypeError):
            talent_start = 10

        # Extract talent slots (8 consecutive abilities starting at talent_start)
        talents = []
        for i in range(8):
            vpk_slot = talent_start + i
            key = f'Ability{vpk_slot}'
            abil_name = d.get(key)
            if not abil_name:
                continue
            aid = ability_ids.get(abil_name)
            if aid is None:
                print(f'  WARN: no ID for {abil_name} (hero={name}, slot={vpk_slot})', file=sys.stderr)
                continue

            level = 10 + (i // 2) * 5
            tier = i // 2
            is_left = (i % 2 == 0)
            our_slot = tier * 2 + (0 if not is_left else 1)

            dn = loc_map.get(abil_name, abil_name)

            talents.append({
                'slot': our_slot,
                'abilityId': aid,
                'abilityName': abil_name,
                'displayName': dn,
                'level': level,
                'side': 'L' if is_left else 'R',
                'vpk_slot': vpk_slot,
            })

        if len(talents) == 8:
            heroes.append({
                'id': hid,
                'heroKey': hero_key,
                'internalName': name,
                'displayName': display_name,
                'talents': sorted(talents, key=lambda t: t['slot']),
            })

    # Sort by hero ID
    heroes.sort(key=lambda h: h['id'])
    return heroes, ability_ids, loc_map


def build_hero_talent_json(heroes):
    """Generate heroTalents.json format."""
    output = []
    for h in heroes:
        hero_entry = {
            'id': h['id'],
            'displayName': h['displayName'],
            'talents': [{'slot': t['slot'], 'abilityId': t['abilityId']} for t in h['talents']],
        }
        output.append(hero_entry)
    return output


def find_missing_abilities(heroes, existing_ab_path):
    """Check which talent ability IDs are missing from existing abilities.json."""
    with open(existing_ab_path, 'r', encoding='utf-8') as f:
        existing = json.load(f)
    existing_ids = {a['id'] for a in existing}

    talent_ids = {}
    for h in heroes:
        for t in h['talents']:
            talent_ids[t['abilityId']] = t

    missing_ids = set(talent_ids.keys()) - existing_ids
    return missing_ids, talent_ids, existing


def update_abilities_json(existing_ab_path, heroes, ability_ids, loc_map):
    """Add missing talent abilities to abilities.json."""
    missing, talent_map, existing = find_missing_abilities(heroes, existing_ab_path)

    if not missing:
        print('  No missing talent abilities to add.')
        return False

    # Get ability type info from npc_abilities.txt
    txt = read_vpk_text('scripts/npc/npc_abilities.txt')
    sections = parse_kv_sections(txt)

    added = 0
    for aid in sorted(missing):
        t = talent_map[aid]
        abil_name = t['abilityName']
        dn = loc_map.get(abil_name, abil_name)

        # Find the ability definition in npc_abilities.txt
        block = sections.get(abil_name, '')
        d = parse_kv_to_dict(block) if block else {}

        entry = {
            'id': aid,
            'name': abil_name,
            'isTalent': True,
            'language': {
                'displayName': dn,
                'description': [],
            },
        }
        existing.append(entry)
        added += 1
        print(f'  Added ability {aid}: {abil_name} = "{dn}"')

    with open(existing_ab_path, 'w', encoding='utf-8') as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)
    print(f'  Added {added} missing abilities to abilities.json')
    return True


def update_display_names(existing_ab_path, loc_map):
    """Fix abilities with placeholder display names."""
    with open(existing_ab_path, 'r', encoding='utf-8') as f:
        existing = json.load(f)

    changed = 0
    for a in existing:
        lang = a.get('language')
        if not lang:
            continue
        dn = lang.get('displayName', '')
        if not dn or dn.startswith('Ability '):
            vpk_dn = loc_map.get(a['name'])
            if vpk_dn:
                lang['displayName'] = vpk_dn
                changed += 1
                print(f'  Updated displayName: {a["id"]} {a["name"]} -> "{vpk_dn}"')

    if changed:
        with open(existing_ab_path, 'w', encoding='utf-8') as f:
            json.dump(existing, f, indent=2, ensure_ascii=False)
        print(f'  Updated {changed} display names in abilities.json')
    return changed > 0


def main():
    print('=== Dota 2 VPK Talent Extraction ===')
    print(f'VPK: {DOTA_VPK}')
    print(f'Repo: {REPO_ROOT}')
    print()

    hero_talents_path = os.path.join(REPO_ROOT, 'src', 'main', 'data', 'heroTalents.json')
    abilities_path = os.path.join(REPO_ROOT, 'src', 'main', 'data', 'abilities.json')

    print('Extracting hero talent data from VPK...')
    heroes, ability_ids, loc_map = extract_hero_talents()
    print(f'  Found {len(heroes)} heroes with 8 talent slots')
    print()

    print('Building heroTalents.json...')
    new_ht = build_hero_talent_json(heroes)
    with open(hero_talents_path, 'w', encoding='utf-8') as f:
        json.dump(new_ht, f, indent=2, ensure_ascii=False)
    print(f'  Written {hero_talents_path}')
    print()

    print('Updating abilities.json...')
    update_display_names(abilities_path, loc_map)
    update_abilities_json(abilities_path, heroes, ability_ids, loc_map)
    print()

    print('=== DONE ===')
    print(f'Heroes: {len(heroes)}')
    all_8 = all(len(h['talents']) == 8 for h in heroes)
    print(f'All have 8 talents: {all_8}')


if __name__ == '__main__':
    main()

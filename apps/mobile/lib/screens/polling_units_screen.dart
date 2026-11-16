import 'package:flutter/material.dart';

import '../data/demo_content.dart';
import '../theme/app_theme.dart';
import '../widgets/module_scaffold.dart';

class PollingUnitsScreen extends StatefulWidget {
  const PollingUnitsScreen({super.key});

  @override
  State<PollingUnitsScreen> createState() => _PollingUnitsScreenState();
}

class _PollingUnitsScreenState extends State<PollingUnitsScreen> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final results = demoPollingUnits.where((unit) {
      final needle = _query.toLowerCase().trim();
      if (needle.isEmpty) return true;
      return unit.name.toLowerCase().contains(needle) ||
          unit.code.toLowerCase().contains(needle) ||
          unit.lga.toLowerCase().contains(needle) ||
          unit.state.toLowerCase().contains(needle);
    }).toList();

    return ModuleScaffold(
      title: 'Polling unit info',
      subtitle: 'Synthetic records · never use these to plan real travel',
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
            child: TextField(
              onChanged: (value) => setState(() => _query = value),
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                hintText: 'Search by ward, LGA, state or code',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white.withValues(alpha: 0.95),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
              ),
            ),
          ),
          Expanded(
            child: results.isEmpty
                ? const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Text(
                        'No synthetic unit matched that search.',
                        style: TextStyle(color: Colors.white),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                    itemCount: results.length,
                    itemBuilder: (context, index) {
                      final unit = results[index];
                      return DemoCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              unit.name,
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.emerald),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${unit.ward} · ${unit.lga} · ${unit.state}',
                              style: const TextStyle(fontSize: 13, color: AppColors.charcoal),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(unit.code, style: const TextStyle(fontSize: 11, color: Color(0xFF5B6661))),
                                StatusPill(label: '${unit.registered} registered (demo)'),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

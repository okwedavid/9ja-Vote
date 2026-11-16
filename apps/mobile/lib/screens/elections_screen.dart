import 'package:flutter/material.dart';

import '../data/demo_content.dart';
import '../theme/app_theme.dart';
import '../widgets/module_scaffold.dart';

class ElectionsScreen extends StatelessWidget {
  const ElectionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ModuleScaffold(
      title: 'Election calendar',
      subtitle: 'Demonstration timetable — confirm every date with INEC',
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        itemCount: demoCalendar.length + 1,
        itemBuilder: (context, index) {
          if (index == demoCalendar.length) return const _FooterNote();
          final entry = demoCalendar[index];
          return DemoCard(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 78,
                  child: Text(
                    entry.date,
                    style: const TextStyle(color: AppColors.emerald, fontWeight: FontWeight.w800, fontSize: 13),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      StatusPill(label: entry.phase),
                      const SizedBox(height: 6),
                      Text(
                        entry.title,
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.charcoal),
                      ),
                      const SizedBox(height: 4),
                      Text(entry.detail, style: const TextStyle(fontSize: 13, color: AppColors.charcoal)),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _FooterNote extends StatelessWidget {
  const _FooterNote();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF8E6),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE8CFA0)),
      ),
      child: const Text(
        'These dates illustrate the interface. INEC publishes the only timetable that counts.',
        style: TextStyle(fontSize: 13, color: Color(0xFF6B4A00)),
      ),
    );
  }
}

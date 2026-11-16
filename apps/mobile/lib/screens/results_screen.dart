import 'package:flutter/material.dart';

import '../data/demo_content.dart';
import '../theme/app_theme.dart';
import '../widgets/module_scaffold.dart';

class ResultsScreen extends StatelessWidget {
  const ResultsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ModuleScaffold(
      title: 'Results demo',
      subtitle: 'Synthetic figures · no winner is ever declared',
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          DemoCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (final entry in demoNationalStats.entries)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(entry.key, style: const TextStyle(fontSize: 13, color: Color(0xFF5B6661))),
                        ),
                        Text(
                          entry.value,
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.emerald),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
          DemoCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Share of valid votes received',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.emerald),
                ),
                const SizedBox(height: 12),
                for (final row in demoNationalShare) ...[
                  Row(
                    children: [
                      Expanded(
                        child: Text(row.party, style: const TextStyle(fontSize: 13)),
                      ),
                      Text(
                        '${(row.share * 100).toStringAsFixed(1)}%',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: LinearProgressIndicator(
                      value: row.share,
                      minHeight: 10,
                      backgroundColor: AppColors.mint,
                      valueColor: const AlwaysStoppedAnimation<Color>(AppColors.green),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
                const Text(
                  'Percentages are of valid votes received so far, not of registered voters.',
                  style: TextStyle(fontSize: 12, color: Color(0xFF5B6661)),
                ),
              ],
            ),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 4),
            child: Text(
              'Drill-down to state, LGA and ward is available on the website. The app shows the national view to keep pages light on slow networks.',
              style: TextStyle(fontSize: 12, color: Color(0xFFD7EBE0)),
            ),
          ),
        ],
      ),
    );
  }
}

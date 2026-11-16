import 'package:flutter/material.dart';

import '../data/demo_content.dart';
import '../theme/app_theme.dart';
import '../widgets/module_scaffold.dart';

class PartiesScreen extends StatelessWidget {
  const PartiesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ModuleScaffold(
      title: 'Parties & candidates',
      subtitle: 'Five fictional placeholder parties — no real party is invented here',
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        itemCount: demoParties.length,
        itemBuilder: (context, index) {
          final party = demoParties[index];
          return DemoCard(
            child: ExpansionTile(
              tilePadding: EdgeInsets.zero,
              childrenPadding: EdgeInsets.zero,
              shape: const Border(),
              collapsedShape: const Border(),
              title: Text(
                party.name,
                style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.emerald),
              ),
              subtitle: Text('${party.abbreviation} · candidate: ${party.candidate}'),
              children: [
                const SizedBox(height: 4),
                for (final pledge in party.pledges)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.check_circle, size: 16, color: AppColors.green),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(pledge, style: const TextStyle(fontSize: 13, color: AppColors.charcoal)),
                        ),
                      ],
                    ),
                  ),
                const Align(
                  alignment: Alignment.centerLeft,
                  child: StatusPill(label: 'SYNTHETIC RECORD'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

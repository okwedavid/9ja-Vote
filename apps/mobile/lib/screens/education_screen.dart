import 'package:flutter/material.dart';

import '../data/demo_content.dart';
import '../theme/app_theme.dart';
import '../widgets/module_scaffold.dart';

class EducationScreen extends StatelessWidget {
  const EducationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ModuleScaffold(
      title: 'Voter education',
      subtitle: 'Plain-language guides · INEC runs the official process',
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        itemCount: demoEducation.length,
        itemBuilder: (context, index) {
          final article = demoEducation[index];
          return DemoCard(
            child: InkWell(
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute<void>(builder: (_) => EducationDetailScreen(article: article)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  StatusPill(label: article.category.toUpperCase()),
                  const SizedBox(height: 8),
                  Text(
                    article.title,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.emerald),
                  ),
                  const SizedBox(height: 4),
                  Text(article.summary, style: const TextStyle(fontSize: 13, color: AppColors.charcoal)),
                  const SizedBox(height: 8),
                  const Text(
                    'Read the guide →',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.green),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class EducationDetailScreen extends StatelessWidget {
  const EducationDetailScreen({super.key, required this.article});

  final EducationRecord article;

  @override
  Widget build(BuildContext context) {
    return ModuleScaffold(
      title: article.title,
      subtitle: article.category,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          DemoCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (final paragraph in article.body)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Text(paragraph, style: const TextStyle(fontSize: 14, height: 1.45)),
                  ),
                const Text(
                  'Civic information only. Confirm requirements with INEC before election day.',
                  style: TextStyle(fontSize: 12, color: Color(0xFF5B6661)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

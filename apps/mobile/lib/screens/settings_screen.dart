import 'package:flutter/material.dart';

import '../data/demo_content.dart';
import '../theme/app_theme.dart';
import '../widgets/module_scaffold.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _largeText = false;

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);
    return MediaQuery(
      data: media.copyWith(textScaler: TextScaler.linear(_largeText ? 1.25 : 1.0)),
      child: ModuleScaffold(
        title: 'Help, alerts & accessibility',
        subtitle: 'Everything the app can and cannot do',
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
          children: [
            DemoCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Notifications',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.emerald),
                  ),
                  const SizedBox(height: 10),
                  for (final note in demoNotifications)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(
                            note.unread ? Icons.mark_email_unread : Icons.mark_email_read,
                            size: 18,
                            color: note.unread ? AppColors.gold : AppColors.green,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  note.title,
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                                ),
                                Text(note.body, style: const TextStyle(fontSize: 12, color: Color(0xFF5B6661))),
                                Text(note.age, style: const TextStyle(fontSize: 11, color: Color(0xFF5B6661))),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  const Text(
                    'No SMS or email is sent by this demonstration build.',
                    style: TextStyle(fontSize: 12, color: Color(0xFF5B6661)),
                  ),
                ],
              ),
            ),
            DemoCard(
              child: SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Larger text', style: TextStyle(fontWeight: FontWeight.w700)),
                subtitle: const Text('Scales the whole app by 25%.'),
                value: _largeText,
                onChanged: (value) => setState(() => _largeText = value),
              ),
            ),
            DemoCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Languages',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.emerald),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'English is live. Hausa, Yoruba, Igbo and Naijá are drafted but switched off until native speakers review them.',
                    style: TextStyle(fontSize: 13),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: const [
                      StatusPill(label: 'English'),
                      StatusPill(label: 'Hausa · in review', background: Color(0xFFFDEEC7), foreground: Color(0xFF6B4A00)),
                      StatusPill(label: 'Yorùbá · in review', background: Color(0xFFFDEEC7), foreground: Color(0xFF6B4A00)),
                      StatusPill(label: 'Igbo · in review', background: Color(0xFFFDEEC7), foreground: Color(0xFF6B4A00)),
                      StatusPill(label: 'Naijá · in review', background: Color(0xFFFDEEC7), foreground: Color(0xFF6B4A00)),
                    ],
                  ),
                ],
              ),
            ),
            DemoCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Privacy & security',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.emerald),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'The app stores no personal data, no voter card details and no biometrics. It has no account and no voter register.',
                    style: TextStyle(fontSize: 13),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'An app account would never mean INEC voter registration. Only INEC keeps the register of voters.',
                    style: TextStyle(fontSize: 13),
                  ),
                ],
              ),
            ),
            DemoCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'What this app cannot do',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.emerald),
                  ),
                  SizedBox(height: 8),
                  Text('• Register you to vote\n• Collect your biometrics\n• Cast or count a vote\n• Declare a winner', style: TextStyle(fontSize: 13, height: 1.5)),
                  SizedBox(height: 10),
                  Text(
                    'Demonstration build. Not affiliated with INEC or any government body.',
                    style: TextStyle(fontSize: 12, color: Color(0xFF5B6661)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
